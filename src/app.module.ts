import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppConstants } from './configs/app.constants';
import { LoggingModule } from './shared-modules/logging/logging.module';
import { SendModule } from './modules/send/send.module';

@Module({
  imports: [
    //read .env configs and load it in config files
    ConfigModule.forRoot({
      //app.config
      load: [() => ({
        NODE_ENV: process.env.NODE_ENV,
        CLIENTS_MANAGER_KAFKA_CLIEND_ID: process.env.CLIENTS_MANAGER_KAFKA_CLIEND_ID,
        CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: process.env.CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID,
        CLIENTS_MANAGER_KAFKA_BROKER_URL: process.env.CLIENTS_MANAGER_KAFKA_BROKER_URL,
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED == "true",
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA,
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY,
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT,
        CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: process.env.CLIENTS_MANAGER_KAFKA_BROKER_USERNAME,
        CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: process.env.CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD,
      })],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid(AppConstants.DEV_ENV, AppConstants.TEST_ENV, AppConstants.PROD_ENV).required(),
        CLIENTS_MANAGER_KAFKA_CLIEND_ID: Joi.string().required(),
        CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: Joi.string().required(),
        CLIENTS_MANAGER_KAFKA_BROKER_URL: Joi.string().pattern(new RegExp(AppConstants.IP_PORT_REGEX)).required(),
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: Joi.bool().required(),
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: Joi.string().optional(),
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: Joi.string().optional(),
        CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: Joi.string().optional(),
        CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: Joi.string().optional(),
        CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: Joi.string().optional(),
      }),
    }),
    //custom app modules
    LoggingModule,
    SendModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
