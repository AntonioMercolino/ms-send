import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base-entity.config";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { isDate } from "util/types";
import { Document } from "../entities/document.entity";
import { Recipient } from "./recipient.entity";

@Entity()
export class Notification extends CustomBaseEntity {

    @Column()
    @IsBoolean()
    @Index()
    toBeSent!: boolean;

    @Column()
    @Index()
    errors!: string[];

    @Column()
    @IsDate()
    @Index()
    nextSendingTime!:Date;

    
    @Column()
    @IsString()
    @Index()
    paProtocolNumber!:string;

    @Column()
    @IsString()
    @Index()
    subject!:string;


    @Column()
    @IsString()
    @Index()
    abstract!:string;

    @Column()
    @IsString()
    @Index()
    taxonomyCode!:string;

    @Column()
    @IsString()
    @Index()
    notificationFeePolicy!:string;

    @Column()
    @IsString()
    @Index()
    senderTaxId!:string;

    @Column()
    @IsString()
    @Index()
    senderDenomination!:string;

    @Column()
    @IsString()
    @Index()
    group!:string;

    @Column()
    @IsString()
    @Index()
    physicalCommunicationType!:string;

    @Column()
    @IsNumber()
    @Index()
    vat!:number;

    @Column()
    @IsNumber()
    @Index()
    paFree!:number;
    
    
    @Column()
    @IsString()
    @Index()
    paymentExpirationDate!:string;

    @Column()
    @IsNumber()
    @Index()
    amount!:number;
    
    @Column()
    @IsString()
    @Index()
    cancelledIun!:string;
    
    @IsOptional()
    @OneToMany((type) => Document, (document) =>document.notificationId)
    documents?: Document[];

    @OneToMany(() => Recipient, (recipient) => recipient.notificationId)
    recipient!: Recipient[];
}















