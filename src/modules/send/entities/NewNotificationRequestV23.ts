import { NewNotificationRequestV23, NewNotificationRequestV23PagoPaIntModeEnum, NewNotificationRequestV23PhysicalCommunicationTypeEnum, NotificationDocument, NotificationFeePolicy, NotificationRecipientV23 } from "../clientAPI/apiClient";

export class NewNotificationRequestAPIs implements NewNotificationRequestV23{
    idempotenceToken?: string | undefined;
    paProtocolNumber: string = "";
    subject: string = "";
    abstract?: string | undefined;
    recipients: NotificationRecipientV23[] = [];
    documents: NotificationDocument[] = [];
    notificationFeePolicy: NotificationFeePolicy = NotificationFeePolicy.DeliveryMode;
    cancelledIun?: string | undefined;
    physicalCommunicationType: NewNotificationRequestV23PhysicalCommunicationTypeEnum = NewNotificationRequestV23PhysicalCommunicationTypeEnum.ArRegisteredLetter;
    senderDenomination: string = "";
    senderTaxId: string = "";
    group?: string | undefined;
    amount?: number | undefined;
    paymentExpirationDate?: string | undefined;
    taxonomyCode: string = "";
    paFee?: number | undefined;
    vat?: number | undefined;
    pagoPaIntMode?: NewNotificationRequestV23PagoPaIntModeEnum | undefined;
}