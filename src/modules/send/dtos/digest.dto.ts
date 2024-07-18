import { IsString } from 'class-validator';

export class DigestDTO {

    @IsString()
    sha256!: string;
}
