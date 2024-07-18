import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification} from "../entities/notification.entity";


export class NotificationRepository extends Repository<Notification> {
    constructor(
        @InjectRepository(Notification)
        private repository: Repository<Notification>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}