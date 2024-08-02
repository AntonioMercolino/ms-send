import { IsBoolean, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Attachment } from './attachment.dto';

export class PagoPa {

    @IsString()
    noticeCode!: string;

    @IsString()
    creditorTaxId!: string;

    @IsBoolean()
    applyCost!: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => Attachment)
    attachment?: Attachment;
}
