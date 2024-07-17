import { IsString } from "class-validator";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base-entity.config";
import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { Notification } from "../entities/notification.entity";
import { DigitalDomicileDTO } from "../dtos/digitalDomicile.dto";
import { PhysicalAddressDTO } from "../dtos/physicalAdress.dto";
import { Payment } from "./payment.entity";
import { PhysicalAddress } from "./physicalAdress.entity";
import { DigitalDomicile } from "./digitalDomicile.entity";


Entity()
export class Recipient extends CustomBaseEntity {

    @Column()
    @IsString()
    @Index()
    taxId!:string;

    @Column()
    @IsString()
    @Index()
    denomination!:string;
    
    @Column()
    @IsString()
    @Index()
    recipientType!:string;

    @Column()
    @IsString()
    @Index()
    internalId!:string;

    @Column(() => PhysicalAddress)
    physicalAddress!: PhysicalAddress;

    @Column(() => DigitalDomicile)
    digitalDomicile!:DigitalDomicile;


    @ManyToOne(() => Notification, (notification) => notification.recipient)
    notificationId!: string;

    @Column()
    @Index()
    payments!: Payment;
}