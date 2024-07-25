import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsManagerTransport } from './transports/clients-manager.transport';
import { ClientsManagerModule } from '../clients-manager/clients-manager.module';
import { ClientsManagerService } from '../clients-manager/services/clients-manager.service';

@Module({
    imports: [
        //read .env configs and load it in config files
        ConfigModule.forRoot({
            //logging.config
            load: [() => ({
                LOGGING_NAME: process.env.LOGGING_NAME,
                LOGGING_LEVEL: process.env.LOGGING_LEVEL,
                LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT: process.env.LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT == "true",
            })],
            validationSchema: Joi.object({
                LOGGING_NAME: Joi.string().required(),
                LOGGING_LEVEL: Joi.string().valid("silent", "fatal", "error", "warn", "info", "debug", "trace").required(),
                LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT: Joi.bool().required(),
            }),
        }),
        //configure pino-logger
        LoggerModule.forRootAsync({
            imports: [ConfigModule, ClientsManagerModule],
            inject: [ConfigService, ClientsManagerService],
            useFactory: async (configService: ConfigService, clientsManagerService: ClientsManagerService) => {
                let pinoHttpConfig: any = {
                    name: configService.get('LOGGING_NAME')!,
                    level: configService.get('LOGGING_LEVEL')!,
                    transport: configService.get('LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT') != 'true'
                        ? { target: 'pino-pretty' }
                        : undefined,
                    formatters: {
                        level: (label: string) => {
                            return { level: label };
                        },
                    },
                    serializers: {
                        req: function (req: any) {
                            let userId: string = undefined!;
                            let basePath: string = "";
                            try {//try parse user data from jwt
                                userId = JSON.parse(Buffer.from(req.headers['authorization'].split('.')[1], 'base64').toString()).sub;
                            } catch (e) { }
                            try {//try get the base path if present
                                basePath = req.url.split("\/")[1];
                            } catch (e) { }
                            return {
                                method: req.method,
                                url: req.url,
                                basePath: basePath,
                                remoteAddress: req.remoteAddress,
                                size: req.headers ? req.headers['content-length'] : undefined,
                                userId: userId
                            };
                        },
                        res: (res: any) => ({
                            statusCode: res.statusCode,
                            size: res.headers ? res.headers['content-length'] : undefined
                        }),
                    }
                };
                if (configService.get('LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT') == 'true') {
                    pinoHttpConfig.stream = new ClientsManagerTransport(clientsManagerService);//custom transport to send log to clients-manager-module
                    //pinoHttpConfig.timestamp= pino.stdTimeFunctions.isoTime;
                }
                return {
                    pinoHttp: pinoHttpConfig
                };
            },
        }),
        ClientsManagerModule,
    ],
    providers: [ClientsManagerTransport],
    exports: [],
    controllers: [],
})
export class LoggingModule { }