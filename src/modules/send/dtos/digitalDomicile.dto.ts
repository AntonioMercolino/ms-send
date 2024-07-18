import { IsString } from 'class-validator';

export class DigitalDomicileDTO {

    @IsString()
    type!: string;

    @IsString()
    address!: string;
}
