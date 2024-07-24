import { IsOptional } from 'class-validator';
import { F24DTO } from './f24.dto';
import { PagoPaDTO } from './pagoPa.dto';


export class PaymentDTO {

    @IsOptional()
    pagoPa?: PagoPaDTO;

    @IsOptional()
    f24?: F24DTO;
}
