import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Attachment } from './attachmenti.entity';


@Entity()
export class PagoPa {

    @Column()
    @IsString()
    noticeCode!: string;

    @Column()
    @IsString()
    creditorTaxId!: string;

    @Column()
    @IsBoolean()
    applyCost!: boolean;

    @Column(() => Attachment)
    attachment!: Attachment;
}
