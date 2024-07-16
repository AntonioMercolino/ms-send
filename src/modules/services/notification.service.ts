import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationRepository} from "../repositories/notification.repository";
import { RecipientRepository } from "../repositories/recipient.repository";
import { DocumentRepository } from "../repositories/document.repository";
import { Transactional } from "typeorm-transactional";
import { Notification  } from "../entities/notification.entity";

@Injectable ()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    constructor(
        @InjectRepository(NotificationRepository) 
        private readonly notificationRepository : NotificationRepository,
        @InjectRepository(RecipientRepository)
        private readonly recipientRepository : RecipientRepository,
        @InjectRepository (DocumentRepository)
        private readonly documentRepository : DocumentRepository
    )
{}
@Transactional()
async saveOrUpdate (notification : Notification ) : Promise <Notification > {
    let notificationToUpdate : Notification | null;
    //UPDATE CASE 
    if (notification.id){
        notificationToUpdate = await this.notificationRepository.findOneBy({ id: notification.id });
        if (!notificationToUpdate) {
            throw new Error("It's not possible to update ");
        }
    }
     //SAVE CASE
     return this.notificationRepository.save(notification);

}



}
