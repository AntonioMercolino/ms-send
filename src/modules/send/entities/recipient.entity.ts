import { IsString } from 'class-validator';
import { CustomBaseEntity } from '../../../shared-modules/database/entities/custom-base-entity.config';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Notification } from './notification.entity';
import { DigitalDomicileDTO } from '../dtos/digitalDomicile.dto';
import { PaymentDTO } from '../dtos/payment.dto';
import { Expose, Type } from 'class-transformer';
import { PhysicalAddressDTO } from '../dtos/physicalAdress.dto';

@Entity()
export class Recipient extends CustomBaseEntity {

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

    @Column('json')
    @Expose()
    physicalAddress!: PhysicalAddressDTO;

    @Column('json')
    @Expose()
    digitalDomicile!: DigitalDomicileDTO;

    @ManyToOne(() => Notification, (notification) => notification.recipients, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    notificationId!: Notification;

    @Column('json')
    @Expose()
    payments!: PaymentDTO[];
}
