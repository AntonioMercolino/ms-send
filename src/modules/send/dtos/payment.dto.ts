import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { F24DTO } from './f24.dto';
import { PagoPaDTO } from './pagoPa.dto';

export class PaymentDTO {

    @IsOptional()
    @ValidateNested()
    @Type(() => PagoPaDTO)
    pagoPa?: PagoPaDTO;

    @IsOptional()
    @ValidateNested()
    @Type(() => F24DTO)
    f24?: F24DTO;
}
