import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Attachment } from './attachment.dto';
import { Type } from 'class-transformer';


export class F24 {

    @IsString()
    title!: string;

    @IsBoolean()
    applyCost!: boolean;
     
    @ValidateNested()
    @Type(() => Attachment)
    metadataAttachment!: Attachment;
}
