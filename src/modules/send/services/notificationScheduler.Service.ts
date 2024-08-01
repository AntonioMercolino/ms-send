import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from '../repositories/notification.repository';
import { SendService } from './send.Service';
import { Notification } from '../entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from '../clientAPI/apiClient';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationSchedulerService {
  private sendSchedulerCronExpression: string;
  private sendMaxSendingAttempsNumber: number;

  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    private readonly configService: ConfigService,
    private readonly sendService: SendService,
    configAPI: Configuration,


  ) {
    configAPI.basePath = this.configService.get<string>('BASE_URL');
    configAPI.apiKey = this.configService.get<string>('API_KEY');
    this.sendSchedulerCronExpression = this.configService.get<string>('SEND_SCHEDULER_CRON_EXPRESSION') || CronExpression.EVERY_HOUR;
    this.sendMaxSendingAttempsNumber = this.configService.get<number>('SEND_MAX_SENDING_ATTEMPTS_NUMBER') || 5;
    sendService = new SendService(configService, configAPI)
  }

  async scheduleNotification(): Promise<void> {

    const notifications: Notification[] = await this.notificationRepository.find({
      where: { toBeSent: true },
    });

    for (const notification of notifications) {
      const success = await this.sendService.sendNotification(notification);

      if (success) {

        notification.toBeSent = false;
        await this.notificationRepository.save(notification);
      } else {
        console.error('Errore durante l\'invio della notifica:', notification.id);
      }
    }
  }
}

