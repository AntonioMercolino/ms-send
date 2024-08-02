import { IsString } from 'class-validator';

export class Digest {
    @IsString()
    sha256!: string;
}
