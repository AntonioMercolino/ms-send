import { IsOptional, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Digest } from './digest.entity';
import { Ref } from './ref.entity';

@Entity()
export class Attachment {

    @Column(() => Digest)
    digests!: Digest[];

    @Column(() => Ref)
    @IsOptional()
    ref?: Ref;

    @Column()
    @IsString()
    contentType!: string;
}
