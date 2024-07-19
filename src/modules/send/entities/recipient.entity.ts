import { IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "../../../shared-modules/database/entities/custom-base-entity.config";
import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { Notification } from "./notification.entity";
import { DigitalDomicileDTO } from "../dtos/digitalDomicile.dto";
import { PhysicalAddressDTO } from "../dtos/physicalAdress.dto";
import { PaymentDTO } from "../dtos/payment.dto";

@Entity()
export class  Recipient extends CustomBaseEntity {

    @Column()
    @IsString()
    @Index()
    taxId!: string;

    @Column()
    @IsString()
    @Index()
    denomination!: string;

    @Column()
    @IsString()
    @Index()
    recipientType!: string;

    @Column()
    @IsString()
    @Index()
    internalId!: string;

    @Column(() => PhysicalAddressDTO)
    physicalAddress!: PhysicalAddressDTO;

    @Column(() => DigitalDomicileDTO)
    digitalDomicile!: DigitalDomicileDTO;
    
    @ManyToOne(() => Notification, (notification) => notification.recipient)
    notificationId!: Notification;

    @Column(() => PaymentDTO)
    payments!: PaymentDTO;
}