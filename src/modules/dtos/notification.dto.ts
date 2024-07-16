import { IsArray, IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { DocumentDTO } from './document.dto';
import { RecipientDTO } from './recipient.dto';


export class NotificationDTO {

    @IsString()
    id!: string;

    @IsBoolean()
    toBeSent!: boolean;

    @IsArray()
    errors!: string[];

    @IsDate()
    nextSendingTime!: Date;

    @IsString()
    paProtocolNumber!: string;

    @IsString()
    subject!: string;

    @IsString()
    abstract!: string;

    @IsString()
    taxonomyCode!: string;

    @IsString()
    notificationFeePolicy!: string;

    @IsString()
    senderTaxId!: string;

    @IsString()
    senderDenomination!: string;

    @IsString()
    group!: string;

    @IsString()
    physicalCommunicationType!: string;

    @IsString()
    pagoPaIntMode!: string;

    @IsNumber()
    vat!: number;

    @IsNumber()
    paFee!: number;

    @IsString()
    paymentExpirationDate!: string;

    @IsNumber()
    amount!: number;

    @IsString()
    cancelledIun!: string;

    @IsArray()
    documents!: DocumentDTO[];

    @IsArray()
    recipients!: RecipientDTO[];
}
