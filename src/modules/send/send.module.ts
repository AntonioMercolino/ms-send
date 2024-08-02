import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared-modules/database/database.module";
import { Recipient } from "./entities/recipient.entity";
import { NotificationController } from "./controlles/notification.controller";
import { NotificationService } from "./services/notification.service";
import { NotificationRepository } from "./repositories/notification.repository";
import { DocumentRepository } from "./repositories/document.repository";
import { RecipientRepository } from "./repositories/recipient.repository";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [() => ({
                SEND_SCHEDULER_CRON_EXPRESSION: process.env.SEND_SCHEDULER_CRON_EXPRESSION,
                SEND_MAX_SENDING_ATTEMPTS_NUMBER: process.env.SEND_MAX_SENDING_ATTEMPTS_NUMBER,
                API_KEY: process.env.API_KEY,
                BASE_URL: process.env.BASE_URL,
            })],
            validationSchema: Joi.object({
                SEND_SCHEDULER_CRON_EXPRESSION: Joi.string().optional(),
                SEND_MAX_SENDING_ATTEMPTS_NUMBER: Joi.string().optional(),
                API_KEY: Joi.string().required(),
                BASE_URL: Joi.string().required(),
            })
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([Notification, Document, Recipient]),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationRepository, DocumentRepository, RecipientRepository]
})
export class SendModule { }