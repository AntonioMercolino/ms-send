import { IsBoolean, IsString } from 'class-validator';
import { Attachment } from './attachment.dto';


export class F24 {

    @IsString()
    title!: string;

    @IsBoolean()
    applyCost!: boolean;

    metadataAttachment!: Attachment;
}
