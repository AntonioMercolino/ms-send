import { IsOptional, IsString } from 'class-validator';
import { DigestDTO } from './digest.dto';
import { RefDTO } from './ref.dto';

export class AttachmentDTO {

    digests!: DigestDTO[];

    @IsOptional()
    ref?: RefDTO;

    @IsString()
    contentType!: string;
}
