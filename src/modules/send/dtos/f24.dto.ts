import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttachmentDTO } from './attachment.dto';

export class F24DTO {

    @IsString()
    title!: string;

    @IsBoolean()
    applyCost!: boolean;

    @ValidateNested()
    @Type(() => AttachmentDTO)
    metadataAttachment!: AttachmentDTO;
}
