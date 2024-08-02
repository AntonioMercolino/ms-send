import { IsOptional, IsString } from 'class-validator';

export class PhysicalAddressDTO {

    @IsOptional()
    @IsString()
    at?: string;

    @IsString()
    address!: string;

    @IsOptional()
    @IsString()
    addressDetails?: string;

    @IsOptional()
    @IsString()
    zip?: string;

    @IsString()
    municipality!: string;

    @IsOptional()
    @IsString()
    municipalityDetails?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    foreignState?: string;
}
