import { IsBoolean, IsString } from 'class-validator';
import { AttachmentDTO } from './attachment.dto';


export class PagoPaDTO {

    @IsString()
    noticeCode!: string;

    @IsString()
    creditorTaxId!: string;

    @IsBoolean()
    applyCost!: boolean;

    attachment!: AttachmentDTO;
}
