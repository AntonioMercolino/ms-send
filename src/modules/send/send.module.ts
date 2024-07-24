import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/shared-modules/database/database.module";
import { Recipient } from "./entities/recipient.entity";
import { NotificationController } from "./controlles/notification.controller";
import { NotificationService } from "./services/notification.service";
import { NotificationRepository } from "./repositories/notification.repository";
import { DocumentRepository } from "./repositories/document.repository";
import { RecipientRepository } from "./repositories/recipient.repository";

@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([Notification,Document,Recipient]),      
    ],
    controllers: [NotificationController],
    providers: [NotificationService,NotificationRepository,DocumentRepository, RecipientRepository]
})
export class SendModule { }