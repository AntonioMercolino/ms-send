import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from '../repositories/notification.repository';
import { SendService } from './send.Service';
import { Notification } from '../entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from '../clientAPI/apiClient';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    private readonly configService: ConfigService,
    private readonly sendService: SendService,
    configAPI: Configuration,
  ) {
    configAPI.basePath = this.configService.get<string>('BASE_URL');
    configAPI.apiKey = this.configService.get<string>('API_KEY');
    sendService = new SendService(configService, configAPI);
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
 