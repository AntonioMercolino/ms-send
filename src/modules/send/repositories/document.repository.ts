import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Document } from "../entities/document.entity";

export class DocumentRepository extends Repository<Document> {
    constructor(
        @InjectRepository(Document)
        private repository: Repository<Document>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}