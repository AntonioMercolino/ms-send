import { IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "../../../shared-modules/database/entities/custom-base-entity.config";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Notification } from "./notification.entity";
import { RefDTO } from "../dtos/ref.dto";
import { DigestDTO } from "../dtos/digest.dto";


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

    @Column(() => DigestDTO)
    digests!: DigestDTO;

    @Column(() => RefDTO)
    ref!: RefDTO;

    @Column()
    @IsString()
    @Index()
    title!: string;

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

    @IsOptional()
    @IsString()
    x_amz_version_id?: string;

    @ManyToOne(() => Notification, (notification) => notification.documents)
    notificationId!: Notification;
}