import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity()
export class Digest {

    @Column()
    @IsString()
    sha256!: string;
}