import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity()
export class DigitalDomicile {

    @Column()
    @IsString()
    type!: string;

    @Column()
    @IsString()
    address!: string;
}
