import { IsBoolean, IsString } from 'class-validator';
import { AttachmentDTO } from './attachment.dto';


export class F24DTO {

    @IsString()
    title!: string;

    @IsBoolean()
    applyCost!: boolean;

    metadataAttachment!: AttachmentDTO;
}
