import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { Document } from "./document.entity";
import { Recipient } from "./recipient.entity";
import { CustomBaseEntity } from "../../../shared-modules/database/entities/custom-base-entity.config";
import { ClassSerializerInterceptor, UseInterceptors } from "@nestjs/common";
import { Transform, Type,Exclude, Expose } from "class-transformer";
import { string } from "joi";

@Entity()
@UseInterceptors(ClassSerializerInterceptor)
export class Notification extends CustomBaseEntity  {

    @Column()
    @IsBoolean()
    @Index()
    @Expose()
    toBeSent!: boolean;

    @Expose()
    @Column('simple-json', { default: '[]' })
    errors!: string[];

    @Expose()
    @Column()
    @IsDate()
    @Type(() => Date)
    @Index()
    nextSendingTime!: Date;

    @Expose()
    @Column()
    @IsString()
    @Index()
    paProtocolNumber!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    subject!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    abstract!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    taxonomyCode!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    notificationFeePolicy!: string ;

    @Expose()
    @Column()
    @IsString()
    @Index()
    senderTaxId!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    senderDenomination!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    group!: string;

    @Expose()
    @Column()
    @IsString()
    @Index()
    physicalCommunicationType!: string;
    @Expose()
    @Column()
    @IsNumber()
    @Type(() => Number)
    @Index()
    vat!: number;
    
    @Expose()
    @Column()
    @IsNumber()
    @Index()
    @Type(() => Number)
    paFee!: number;

    @Expose()
    @Column()
    @IsString()
    @Index()
    paymentExpirationDate!: string;
    
    @Expose()
    @Column()
    @IsNumber()
    @Type(() => Number)
    @Index()
    amount!: number;
    
    @Expose()
    @Column()
    @IsString()
    @Index()
    cancelledIun!: string;
    
    @Expose()    
    @Column()
    @IsString()
    @Index()
    pagoPaIntMode!: string;

    @Expose()    
    @Type(() => Document)
    @OneToMany((type) => Document, (document) => document.notificationId,{
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    documents!: Document[];

    @Expose()    
    @Type(() => Recipient)
    @OneToMany(() => Recipient, (recipient) => recipient.notificationId,{
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    recipient!: Recipient[];

    
}
