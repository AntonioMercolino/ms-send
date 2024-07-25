import { CreateDateColumn, DeleteDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

export class CustomBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Index()
    @CreateDateColumn()
    createdAt?: Date;
    @Index()
    @UpdateDateColumn()
    updatedAt?: Date
    @VersionColumn()
    version?: number
    @DeleteDateColumn()
    deletedAt?: Date;
}