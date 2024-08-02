import { IsString } from 'class-validator';

export class DigitalDomicile {

    @IsString()
    type!: string;

    @IsString()
    address!: string;
}
