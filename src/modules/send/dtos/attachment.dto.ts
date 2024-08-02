import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Digest} from './digest.dto';
import { Ref} from './ref.dto';

export class Attachment {
    @ValidateNested()
    @Type(() => Digest)
    digests!: Digest;

    @IsOptional()
    @ValidateNested()
    @Type(() => Ref)
    ref!: Ref;

    @IsString()
    contentType!: string;
}