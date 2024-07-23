import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { Document } from "./document.entity";
import { Recipient } from "./recipient.entity";
import { CustomBaseEntity } from "../../../shared-modules/database/entities/custom-base-entity.config";

@Entity()
export class Notification extends CustomBaseEntity {

    @Column()
    @IsBoolean()
    @Index()
    toBeSent!: boolean;

    @Column('simple-json', { default: '[]' })
    errors!: string[];

    @Column()
    @IsDate()
    @Index()
    nextSendingTime!: Date;

    @Column()
    @IsString()
    @Index()
    paProtocolNumber!: string;

    @Column()
    @IsString()
    @Index()
    subject!: string;

    @Column()
    @IsString()
    @Index()
    abstract!: string;

    @Column()
    @IsString()
    @Index()
    taxonomyCode!: string;

    @Column()
    @IsString()
    @Index()
    notificationFeePolicy!: string;

    @Column()
    @IsString()
    @Index()
    senderTaxId!: string;

    @Column()
    @IsString()
    @Index()
    senderDenomination!: string;

    @Column()
    @IsString()
    @Index()
    group!: string;

    @Column()
    @IsString()
    @Index()
    physicalCommunicationType!: string;

    @Column()
    @IsNumber()
    @Index()
    vat!: number;

    @Column()
    @IsNumber()
    @Index()
    paFree!: number;

    @Column()
    @IsString()
    @Index()
    paymentExpirationDate!: string;

    @Column()
    @IsNumber()
    @Index()
    amount!: number;

    @Column()
    @IsString()
    @Index()
    cancelledIun!: string;

    @IsOptional()
    @OneToMany((type) => Document, (document) => document.notificationId,{
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    documents?: Document[];

    @IsOptional()
    @OneToMany(() => Recipient, (recipient) => recipient.notificationId,{
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    recipient?: Recipient[];
    
}