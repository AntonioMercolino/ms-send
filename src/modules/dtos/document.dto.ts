import { IsOptional, IsString } from 'class-validator';
import { RefDTO } from './ref.dto';
import { DigestDTO } from './digest.dto';


export class DocumentDTO {

    @IsString()
    id!: string;

    @IsString()
    notificationId!: string;

    @IsString()
    path!: string;

    @IsString()
    contentType!: string;

    digests!: DigestDTO;

    ref!: RefDTO;

    @IsString()
    title!: string;

    @IsString()
    docIdx!: string;

    @IsString()
    url!: string;

    @IsString()
    httpMethod!: string;

    @IsOptional()
    @IsString()
    secret?: string;

    @IsOptional()
    @IsString()
    x_amz_version_id?: string;
}
