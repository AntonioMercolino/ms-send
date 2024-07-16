import { IsOptional, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity()
export class Ref {

    @Column()
    @IsString()
    key!: string;

    @Column()
    @IsString()
    @IsOptional()
    versionToken?: string;
}