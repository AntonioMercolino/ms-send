import { IsOptional, IsString } from 'class-validator';
import { CustomBaseEntity } from '../../../shared-modules/database/entities/custom-base-entity.config';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Notification } from './notification.entity';
import { Ref} from '../dtos/ref.dto';
import { Digest } from '../dtos/digest.dto';

@Entity()
export class Document extends CustomBaseEntity {

    @Column()
    @IsString()
    @Index()
    path!: string;

    @Column()
    @IsString()
    @Index()
    contentType!: string;

    @Column('json')
    digests!: Digest;

    @Column('json')
    ref!: Ref;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsString()
    @IsOptional()
    docIdx?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsString()
    @Index()
    @IsOptional()
    title?: string;

    @Column()
    @IsString()
    @Index()
    url!: string;

    @Column()
    @IsString()
    @Index()
    httpMethod!: string;

    @Column()
    @IsString()
    @Index()
    secret!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsString()
    x_amz_version_id?: string;

    @ManyToOne(() => Notification, (notification) => notification.documents, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    notificationId!: Notification;
}
