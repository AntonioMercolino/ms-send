import { IsString } from "class-validator";

export class ResponseMessage<T> {
    res!: T;
    @IsString()
    error?: string;
}