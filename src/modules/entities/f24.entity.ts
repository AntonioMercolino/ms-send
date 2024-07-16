import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Attachment } from './attachmenti.entity';


@Entity()
export class F24 {

    @Column()
    @IsString()
    title!: string;

    @Column()
    @IsBoolean()
    applyCost!: boolean;

    @Column(() => Attachment)
    metadataAttachment!: Attachment;
}
