import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { ClientsManagerConstants } from './configs/clients-manager.constants';
import { ClientsManagerService } from './services/clients-manager.service';

@Module({
    imports: [
        //read .env configs and load it in config files
        ConfigModule.forRoot({
            //clients-manager.config
            load: [() => ({
                CLIENTS_MANAGER_MOCK_ENABLED: process.env.CLIENTS_MANAGER_MOCK_ENABLED == "true",
                //kafka configs
                CLIENTS_MANAGER_KAFKA_CLIEND_ID: process.env.CLIENTS_MANAGER_KAFKA_CLIEND_ID,
                CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: process.env.CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID,
                CLIENTS_MANAGER_KAFKA_BROKER_URL: process.env.CLIENTS_MANAGER_KAFKA_BROKER_URL,
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED == "true",
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA,
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY,
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT,
                CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: process.env.CLIENTS_MANAGER_KAFKA_BROKER_USERNAME,
                CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: process.env.CLIENTS_MANAGER_KAFKA_BROKER_USERNAME,
            })],
            validationSchema: Joi.object({
                CLIENTS_MANAGER_MOCK_ENABLED: Joi.bool().required(),
                //kafka configs
                CLIENTS_MANAGER_KAFKA_CLIEND_ID: Joi.string().required(),
                CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: Joi.string().required(),
                CLIENTS_MANAGER_KAFKA_BROKER_URL: Joi.string().pattern(new RegExp(ClientsManagerConstants.IP_PORT_REGEX)).required(),
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: Joi.bool().required(),
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: Joi.string().optional(),
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: Joi.string().optional(),
                CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: Joi.string().optional(),
                CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: Joi.string().optional(),
                CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: Joi.string().optional(),
            }),
        }),
        //configure Kafka client
        ClientsModule.registerAsync([{
            imports: [ConfigModule],
            inject: [ConfigService],
            name: ClientsManagerConstants.CLIENT_NAME,
            useFactory: async (configService: ConfigService) => (
                configService.get('CLIENTS_MANAGER_MOCK_ENABLED') == 'true' ?
                    {}
                    :
                    {
                        transport: Transport.KAFKA,
                        options: {
                            client: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_USERNAME') ?
                                {
                                    clientId: configService.get('CLIENTS_MANAGER_KAFKA_CLIEND_ID')!,
                                    brokers: [configService.get('CLIENTS_MANAGER_KAFKA_BROKER_URL')!],
                                    ssl: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED') == 'true' ? {
                                        ca: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA')!,
                                        key: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY')!,
                                        cert: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT')!
                                    } : false,
                                    sasl: {
                                        mechanism: 'scram-sha-512',
                                        username: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_USERNAME')!,
                                        password: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD')!
                                    },
                                }
                                :
                                {
                                    clientId: configService.get('CLIENTS_MANAGER_KAFKA_CLIEND_ID')!,
                                    brokers: [configService.get('CLIENTS_MANAGER_KAFKA_BROKER_URL')!],
                                    ssl: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED') == 'true' ? {
                                        ca: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA')!,
                                        key: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY')!,
                                        cert: configService.get('CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT')!
                                    } : false
                                },
                            consumer:
                            {
                                groupId: configService.get('CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID')!
                            }
                        }
                    }),
        }]),
    ],
    providers: [ClientsManagerService],
    controllers: [],
    exports: [ClientsManagerService],
})
export class ClientsManagerModule { }