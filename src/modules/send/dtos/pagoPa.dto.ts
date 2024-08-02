import { IsBoolean, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AttachmentDTO } from './attachment.dto';

export class PagoPaDTO {

    @IsString()
    noticeCode!: string;

    @IsString()
    creditorTaxId!: string;

    @IsBoolean()
    applyCost!: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => AttachmentDTO)
    attachment?: AttachmentDTO;
}
