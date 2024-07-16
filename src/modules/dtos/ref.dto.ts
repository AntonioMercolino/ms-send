import { IsOptional, IsString } from 'class-validator';

export class RefDTO {

    @IsString()
    key!: string;

    @IsOptional()
    @IsString()
    versionToken?: string;
}
