import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as Joi from 'joi';
import { DatabaseConstants } from './configs/database.constants';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({
    imports: [
        //read .env configs and load it in config files
        ConfigModule.forRoot({
            //database.config
            load: [() => ({
                DB_HOST: process.env.DB_HOST,
                DB_PORT: parseInt(process.env.DB_PORT!, 10),
                DB_USERNAME: process.env.DB_USERNAME,
                DB_PASSWORD: process.env.DB_PASSWORD,
                DB_SCHEMA: process.env.DB_SCHEMA,
                DB_SYNCH: process.env.DB_SYNCH == "true",
            })],
            validationSchema: Joi.object({
                DB_HOST: Joi.string().pattern(new RegExp(DatabaseConstants.IP_REGEX)).required(),
                DB_PORT: Joi.number().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_SCHEMA: Joi.string().required(),
                DB_SYNCH: Joi.bool().required(),
            }),
        }),
        //create db connection for all project entities (all project modules)
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_SCHEMA'),
                //includes all entities inside "entity" directory of modules
                entities: [join(__dirname, '..', '..', '*', '*', 'entities', '*.entity{.ts,.js}')],
                //sync DB with model entities (do NOT use in production to avoid data loss!!!)
                synchronize: configService.get('DB_SYNCH'),
            }),
            async dataSourceFactory(options) {//used for transactional methods
                if (!options) {
                  throw new Error('Invalid options passed');
                }
                return addTransactionalDataSource(new DataSource(options));
            },
        }),
    ],
    providers: [],
    controllers: [],
    exports: [],
})
export class DatabaseModule { }