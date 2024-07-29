import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Notification } from "../entities/notification.entity";
import { Api, HttpClient } from "../clientAPI/SendClient";

@Injectable()
export class SendService {
    private configApi: Api<string>;

    constructor(
        private configService: ConfigService,
    ) {
        const config = {
            BaseUrl: this.configService.get<string>('BASE_URL'),
            APIKEY: this.configService.get<string>('API_KEY')
        }

        this.configApi = new Api({
            baseUrl: config.BaseUrl,
            securityWorker: async (securityData) => {
              return {
                headers: {
                  Authorization: `Bearer ${securityData}`
                }
              };
            }
          });

          // Set security data if needed
          if(config.APIKEY)
            this.configApi.setSecurityData(config.APIKEY);

    }

    async sendNotification(notification: Notification): Promise<boolean> {
        try {
            const response = await this.configApi.delivery.sendNewNotificationV23(notification);
            return response.data && response.data.notificationRequestId ? true : false;
        } catch (error) {
            console.error('Errore durante l\'invio della notifica:', error);
            return false;
        }
    }
}
