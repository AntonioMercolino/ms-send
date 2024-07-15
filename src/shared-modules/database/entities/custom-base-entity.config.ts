import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

export class CustomBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @CreateDateColumn()
    createdAt?: Date;
    @UpdateDateColumn()
    updatedAt?: Date
    @VersionColumn()
    version?: number
    @DeleteDateColumn()
    deletedAt?: Date;
}