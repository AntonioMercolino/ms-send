import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration, 
         NewNotificationApi, 
         NewNotificationRequestV23, 
         NotificationFeePolicy,
         NotificationAttachmentBodyRef, 
         NotificationRecipientV23RecipientTypeEnum, 
         NotificationPaymentItem, 
         NewNotificationRequestV23PhysicalCommunicationTypeEnum, 
         NewNotificationRequestV23PagoPaIntModeEnum, 
         NotificationDigitalAddress} from "../../../../apiClient";
import { Notification } from "../entities/notification.entity";

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
    mapNotification(notification: Notification): NewNotificationRequestV23 {
        return {
            ...notification,
            recipients: notification.recipient.map(recipient => ({
                ...recipient,
                payments: recipient.payments.map(payment => ({...payment})) as NotificationPaymentItem[],
                digitalDomicile: recipient.digitalDomicile as NotificationDigitalAddress,
                recipientType: recipient.recipientType as NotificationRecipientV23RecipientTypeEnum,                    
            })),
            documents: notification.documents.map(document => ({
                ...document,
                ref: document.ref as NotificationAttachmentBodyRef,
            })),
            notificationFeePolicy: notification.notificationFeePolicy as NotificationFeePolicy,
            physicalCommunicationType: notification.physicalCommunicationType as NewNotificationRequestV23PhysicalCommunicationTypeEnum,
            pagoPaIntMode: notification.pagoPaIntMode as NewNotificationRequestV23PagoPaIntModeEnum
        };
    }

    async sendNotification(notification: Notification): Promise<boolean> {
        try {

            const response = await this.newNotificationApi.sendNewNotificationV23(this.mapNotification(notification));
            return response.status === 200;
        } catch (error) {
            console.error('Errore durante l\'invio della notifica:', error);
            return false;
        }
    }
}
