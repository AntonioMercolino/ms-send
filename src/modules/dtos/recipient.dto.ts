import { IsArray, IsOptional, IsString } from 'class-validator';
import { PhysicalAddressDTO } from './physicalAdress.dto';
import { DigitalDomicileDTO } from './digitalDomicile.dto';
import { PaymentDTO } from './payment.dto';


export class RecipientDTO {

    @IsString()
    id!: string;

    @IsString()
    notificationId!: string;

    @IsString()
    taxId!: string;

    @IsString()
    denomination!: string;

    @IsString()
    recipientType!: string;

    physicalAddress!: PhysicalAddressDTO;

    digitalDomicile!: DigitalDomicileDTO;

    @IsString()
    internalId!: string;

    @IsArray()
    payments!: PaymentDTO[];
}
