
import { IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base-entity.config";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Notification } from "../entities/notification.entity";
import { Ref } from "./ref.entity";
import { RefDTO } from "../dtos/ref.dto";
import { Digest } from "./digest.entity";


@Entity()
export class Document extends CustomBaseEntity {
    @Column()
    @IsString()
    @Index()
    notificationId!:string;

    @Column()
    @IsString()
    @Index()
    path!:string;

    @Column()
    @IsString()
    @Index()
    contentType!:string;
 
    @Column(() => Digest)
    digests!: Digest;

    @Column(() => Ref)
    ref!: Ref;

    
    @Column()
    @IsString()
    @Index()
    title!:string;

    
    @Column()
    @IsString()
    @Index()
    url!:string;

    
    @Column()
    @IsString()
    @Index()
    httpMethod!:string;

    
    @Column()
    @IsString()
    @Index()
    secret!:string;
    
    @IsOptional()
    @IsString()
    x_amz_version_id?: string;
    
    @IsOptional()
    @ManyToOne(() => Notification, (notification) => notification.document)
    notification?: Notification;
}