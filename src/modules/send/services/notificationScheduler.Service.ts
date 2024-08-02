import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from '../repositories/notification.repository';
import { SendService } from './send.Service';
import { Notification } from '../entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { And, IsNull, MoreThan, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);
  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    private readonly sendService: SendService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * This method periodically searches for notifications to send and updates their status.
   * At every execution, this method search for an notifications flagged as 'toBeSent' where:
   *  1) the 'errors' column is empty; (the email has never been sent);
   *  2) the 'errors' column is not empty and the 'nextSendingTime' 
   *     column is not empty too.(some sending attempts have already failed, but there are still more attempts available).
   *  
   * There is a fixed number of attempts in which sending an email can fail, after which it will never be sent.
   * 
   *  When a sending attempt fails, the email 'errors' and 'nextSendingTime' columns are updated. 
   *  The nextSendingTime is updated following an exponential backoff.
   */
  @Transactional()
  @Cron(process.env.SEND_SCHEDULER_CRON_EXPRESSION!)
  public async scheduleEmail(): Promise<void> {
    let notifications: Notification[] | null = await this.notificationRepository.find(
      {
        where: [
          { toBeSent: true, errors: IsNull() },
          { toBeSent: true, errors: Not(IsNull()), nextSendingTime: And(Not(IsNull()), MoreThan(new Date())) },
        ],
        order: { updatedAt: "ASC", nextSendingTime: "ASC" },
        skip: 0,
        take: 1
      });
    if (notifications != null) {
      try {
        const success = await this.sendService.sendNotification(notifications[0]);
        if (success === true)
          await this.notificationRepository.update({ id: notifications[0].id }, { toBeSent: false });
        else {
          let errorsList: string[] = notifications[0].errors ? notifications[0].errors : [];
          //UPDATING ERRORS COLUMN
          errorsList.push("Errore durante l\'invio della notifica:");
          let attemptNumber = errorsList.length;
          if (attemptNumber < this.configService.get('SEND_MAX_SENDING_ATTEMPTS_NUMBER')) {
            await this.updateNotificationErrors(notifications[0], errorsList, attemptNumber, false);
          } else {
            await this.updateNotificationErrors(notifications[0], errorsList, attemptNumber, true);
          }
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * This method update the Notification 'errors' and 'nextSendingTime' columns.
   * The nextSendingTime column is updated following an exponential backoff;
   * 
   * @param notification Notification - the record to update
   * @param updatedErrors JSON - the list of errors to save
   * @param attemptNumber number - how many attempts were made to send this email
   * @param clearNextSendingTime boolean - if true the nextSendingTime column will be cleared
   */
  private async updateNotificationErrors(notification: Notification, updatedErrors: string[], attemptNumber: number, clearNextSendingTime: boolean): Promise<void> {
    if (clearNextSendingTime) {
      await this.notificationRepository.update({ id: notification.id }, { errors: updatedErrors, nextSendingTime: undefined });
    } else {
      let nextSendingTime: number = (2 ** attemptNumber) * 60 * 60 * 1000 + new Date().getTime();
      await this.notificationRepository.update({ id: notification.id }, { errors: updatedErrors, nextSendingTime: nextSendingTime });
    }
  }
}

