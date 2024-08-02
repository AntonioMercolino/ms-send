import { IsString } from 'class-validator';
import { CustomBaseEntity } from '../../../shared-modules/database/entities/custom-base-entity.config';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Notification } from './notification.entity';
import { Expose} from 'class-transformer';
import { PhysicalAddress } from '../clientAPI/apiClient';
import { DigitalDomicile } from '../dtos/digitalDomicile.dto';
import { Payment } from '../dtos/payment.dto';

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
    physicalAddress!: PhysicalAddress;

    @Column('json')
    @Expose()
    digitalDomicile!: DigitalDomicile;

    @ManyToOne(() => Notification, (notification) => notification.recipient, {
        cascade:true,
    })
    notification!: Notification;

    @Column('json')
    @Expose()
    payments!: Payment[];
}
