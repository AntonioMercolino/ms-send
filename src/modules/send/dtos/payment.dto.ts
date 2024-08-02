import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { F24 } from './f24.dto';
import { PagoPa } from './pagoPa.dto';

export class Payment {

    @IsOptional()
    @ValidateNested()
    @Type(() => PagoPa)
    pagoPa?: PagoPa;

    @IsOptional()
    @ValidateNested()
    @Type(() => F24)
    f24?: F24;
}
