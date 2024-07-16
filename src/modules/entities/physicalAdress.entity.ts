import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity()
export class PhysicalAddress {

    @Column()
    @IsString()
    at!: string;

    @Column()
    @IsString()
    address!: string;

    @Column()
    @IsString()
    addressDetails!: string;

    @Column()
    @IsString()
    zip!: string;

    @Column()
    @IsString()
    municipality!: string;

    @Column()
    @IsString()
    municipalityDetails!: string;

    @Column()
    @IsString()
    province!: string;

    @Column()
    @IsString()
    foreignState!: string;
}
