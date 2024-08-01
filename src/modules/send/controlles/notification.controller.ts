import { Controller, Logger } from "@nestjs/common";
import { NotificationService } from "../services/notification.service";
import { SendTopic } from "../configs/send-topic";
import { MessagePattern, Payload, RpcException } from "@nestjs/microservices";
import { SendError } from "../configs/send-error";
import { Notification } from "../entities/notification.entity"; 
import { Paginated, PaginateQuery } from "nestjs-paginate";


@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }
    private readonly logger = new Logger(NotificationController.name);
    @MessagePattern(SendTopic.NOTIFICATION_SAVE_OR_UPDATE)
    async seveOrUpdate(@Payload() notification: Notification): Promise<Notification > {
        try {
            return await this.notificationService.saveOrUpdate(notification);
        } catch (e) {
            this.logger.error(e);
            throw new RpcException(SendError.NOTIFICATION_SAVE_OR_UPDATE_ERROR);
        }
    }
    @MessagePattern(SendTopic.NOTIFICATION_FIND)
    async find(@Payload() query: PaginateQuery): Promise<Paginated<Notification> >{
        try {
            return await this.notificationService.find(query);
        } catch (e) {
            this.logger.error(e);
            throw new RpcException(SendError.NOTIFICATION_DELETE_ERROR);
        }    
    }
    @MessagePattern (SendTopic.NOTIFICATION_DELETE)
    async delete(@Payload() notificationId: string): Promise<Notification>{
        try {
            return await this.notificationService.delete(notificationId);
        } catch (e) {
            this.logger.error(e);
            throw new RpcException(SendError.NOTIFICATION_DELETE_ERROR);
        }
    }
}


