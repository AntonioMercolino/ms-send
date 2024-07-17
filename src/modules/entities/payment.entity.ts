import { IsString } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Recipient } from './recipient.entity';
import { F24DTO } from '../dtos/f24.dto';
import { PagoPaDTO } from '../dtos/pagoPa.dto';



@Entity()
export class Payment {

    @Column(() => PagoPaDTO)
    pagoPa!: PagoPaDTO;

    @Column(() => F24DTO)
    f24!: F24DTO;

    @ManyToOne(() => Recipient, (recipient) => recipient.payments)
    recipientId!: Recipient;
}
