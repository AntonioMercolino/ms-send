import { ClassSerializerInterceptor, Injectable, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Notification } from "../entities/notification.entity";
import { plainToClass } from "class-transformer";
import { NewNotificationRequestAPI } from "../dtos/NewNotificationRequestAPIs.dto";
import { Configuration, NewNotificationApi } from "../clientAPI/apiClient";

@Injectable()
export class SendService {
    private newNotificationApi: NewNotificationApi;
    constructor(
        private configService: ConfigService,
        configAPI: Configuration
    ) {
        configAPI.basePath = this.configService.get<string>('BASE_URL');
        configAPI.apiKey = this.configService.get<string>('API_KEY');
        this.newNotificationApi = new NewNotificationApi(configAPI);


    }

    async sendNotification(notification: Notification): Promise<boolean> {
        try {
            const apiRequest = plainToClass(NewNotificationRequestAPI,notification);
            const response = await this.newNotificationApi.sendNewNotificationV23(apiRequest);
            return response.status === 200;
        } catch (error) {
            console.error('Errore durante l\'invio della notifica:', error);
            return false;
        }
    }
}
