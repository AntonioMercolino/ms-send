import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CipherManagerService } from './services/cipher-manager.service';

@Module({
    imports: [
        //read .env configs and load it in config files
        ConfigModule.forRoot({
            //cipher-manager.config
            load: [() => ({

            })],
            validationSchema: Joi.object({

            }),
        }),
    ],
    providers: [CipherManagerService],
    controllers: [],
    exports: [CipherManagerService],
})
export class CipherManagerModule { }