import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DigestDTO } from './digest.dto';
import { RefDTO } from './ref.dto';

export class AttachmentDTO {
    @ValidateNested()
    @Type(() => DigestDTO)
    digests!: DigestDTO;

    @IsOptional()
    @ValidateNested()
    @Type(() => RefDTO)
    ref!: RefDTO;

    @IsString()
    contentType!: string;
}