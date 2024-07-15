import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { FileSystemService } from './services/file-system.service';

@Module({
    imports: [
        //read .env configs and load it in config files
        ConfigModule.forRoot({
            //file-system.config
            load: [() => ({
                FS_PATH: process.env.FS_PATH,
                FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH: process.env.FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH,
            })],
            validationSchema: Joi.object({
                FS_PATH: Joi.string().required(),
                FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH: Joi.string().optional()
            }),
        }),
    ],
    providers: [FileSystemService],
    controllers: [],
    exports: [FileSystemService],
})
export class FileSystemModule { }