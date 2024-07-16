import { IsString } from 'class-validator';

export class PhysicalAddressDTO {

    @IsString()
    at!: string;

    @IsString()
    address!: string;

    @IsString()
    addressDetails!: string;

    @IsString()
    zip!: string;

    @IsString()
    municipality!: string;

    @IsString()
    municipalityDetails!: string;

    @IsString()
    province!: string;

    @IsString()
    foreignState!: string;
}
