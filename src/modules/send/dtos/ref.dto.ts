import { IsOptional, IsString } from 'class-validator';

export class Ref {

    @IsString()
    key!: string;

    @IsOptional()
    @IsString()
    versionToken?: string;
}
