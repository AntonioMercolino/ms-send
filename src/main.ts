import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  //init transactional configurations
  initializeTransactionalContext();
  //create microservice app by using Kafka broker
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: process.env.CLIENTS_MANAGER_KAFKA_BROKER_USERNAME ?
          {
            clientId: process.env.CLIENTS_MANAGER_KAFKA_CLIEND_ID!,
            brokers: [process.env.CLIENTS_MANAGER_KAFKA_BROKER_URL!],
            ssl: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED == 'true' ? {
              ca: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA!,
              key: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY!,
              cert: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT!
            } : false,
            sasl: {
              mechanism: 'scram-sha-512',
              username: process.env.CLIENTS_MANAGER_KAFKA_BROKER_USERNAME!,
              password: process.env.CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD!
            },
          }
          :
          {
            clientId: process.env.CLIENTS_MANAGER_KAFKA_CLIEND_ID!,
            brokers: [process.env.CLIENTS_MANAGER_KAFKA_BROKER_URL!],
            ssl: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED == 'true' ? {
              ca: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA!,
              key: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY!,
              cert: process.env.CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT!
            } : false,
          },
        consumer: {
          groupId: process.env.APP_BROKER_GROUP_ID!,
        },
      },
      bufferLogs: true
    },
  );
  //Config for Pino logger
  app.useLogger(app.get(Logger));
  //class validator
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {//wrap the default "Bad request" exception in RpcException
        return new RpcException(errors);
      }
    }
  ));
  //class serializer for the serialization of responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  //microservice listen
  await app.listen();
}
bootstrap();
