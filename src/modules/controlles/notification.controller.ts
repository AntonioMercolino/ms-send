import { Controller, Logger } from "@nestjs/common";
import { NotificationService } from "../services/notification.service";
import { SendTopic } from "../configs/send-topic";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ResponseMessage } from "src/shared-modules/clients-manager/dtos/response-message.dto";
import { SendError } from "../configs/send-error";
import { Notification } from "../entities/notification.entity"; 
import { Paginated, PaginateQuery } from "nestjs-paginate";


@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }
    private readonly logger = new Logger(NotificationController.name);
    @EventPattern(SendTopic.NOTIFICATION_SAVE_OR_UPDATE)
    async seveOrUpdate(@Payload() notification: Notification): Promise<ResponseMessage<Notification | undefined>> {
        let serviceResponse: Notification | undefined = undefined;
        try {
            serviceResponse = await this.notificationService.saveOrUpdate(notification);
            let message: ResponseMessage<Notification | undefined> = {
                res: serviceResponse,
                error: undefined
            };
            return message;

        } catch (e) {
            let message: ResponseMessage<Notification | undefined> = {
                res: serviceResponse,
                error: SendError.NOTIFICATION_SAVE_OR_UPDATE_ERROR
            };
            this.logger.error(e);
            return message;
        }
    }
    @EventPattern(SendTopic.NOTIFICATION_FIND)
    async find(@Payload() query: PaginateQuery): Promise<ResponseMessage<Paginated<Notification> | undefined>>{
        let serviceResponse: Paginated<Notification> | undefined = await this.notificationService.find(query);
        let message: ResponseMessage<Paginated<Notification> | undefined> = {
            res: serviceResponse,
            error: !serviceResponse ? SendError.NOTIFICATION_FIND_ERROR : undefined
        };
        return message;
    }
    @EventPattern (SendTopic.NOTIFICATION_DELETE)
    async delete(@Payload() notificationId: string): Promise<ResponseMessage<Notification | undefined>>{
        let serviceResponse: Notification| undefined = undefined;
        try{
            serviceResponse = await this.notificationService.delete(notificationId);
            let message: ResponseMessage<Notification | undefined> = {
                res: serviceResponse,
                error: undefined
            };
            return message;
        }catch(e){
            let message: ResponseMessage<Notification | undefined> = {
                res: serviceResponse,
                error: SendError.NOTIFICATION_DELETE_ERROR
            };
            return message;
        }  
    }

}


