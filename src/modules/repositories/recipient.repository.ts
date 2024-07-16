import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Recipient } from "../entities/recipient.entity";

export class RecipientRepository extends Repository<Recipient> {
    constructor(
        @InjectRepository(Recipient)
        private repository: Repository<Recipient>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}