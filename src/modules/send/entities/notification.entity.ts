import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Document } from './document.entity';
import { Recipient } from './recipient.entity';
import { CustomBaseEntity } from '../../../shared-modules/database/entities/custom-base-entity.config';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Type,Expose } from 'class-transformer';

@Entity()
@UseInterceptors(ClassSerializerInterceptor)
export class Notification extends CustomBaseEntity {

    @Column()
    @IsBoolean()
    @Index()
    @Expose()
    toBeSent!: boolean;

    @Expose()
    @Column('json', { default: '[]' })
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
    notificationFeePolicy!: string;

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
    @Type(() => Number)
    @Index()
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
    @OneToMany(() => Document, (document) => document.notification, {
      cascade:true,
    })
    documents!: Document[];

    @Expose()
    @Type(() => Recipient)
    @OneToMany(() => Recipient, (recipient) => recipient.notification, {
        cascade:true,
    })
    recipient!: Recipient[];
}
