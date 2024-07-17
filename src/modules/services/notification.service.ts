import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationRepository } from "../repositories/notification.repository";
import { RecipientRepository } from "../repositories/recipient.repository";
import { DocumentRepository } from "../repositories/document.repository";
import { Transactional } from "typeorm-transactional";
import { Notification } from "../entities/notification.entity";
import { Recipient } from "../entities/recipient.entity";
import { Document } from "../entities/document.entity";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";


@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    constructor(
        @InjectRepository(NotificationRepository)
        private readonly notificationRepository: NotificationRepository,
        @InjectRepository(RecipientRepository)
        private readonly recipientRepository: RecipientRepository,
        @InjectRepository(DocumentRepository)
        private readonly documentRepository: DocumentRepository
    ) { }
    @Transactional()
    async saveOrUpdate(notification: Notification): Promise<Notification> {
        let notificationToUpdate: Notification | null;
        let recipientToUpdate: Recipient | null;
        let documentToUpdate: Document | null;
        //UPDATE notification 
        if (notification.id) {
            notificationToUpdate = await this.notificationRepository.findOneBy({ id: notification.id });
            if (!notificationToUpdate) {
                throw new Error("It's not possible to update ");
            }
        }
        //Update recipient
        if (notification.recipient) {
            for (const recipient of notification.recipient) {
                recipientToUpdate = await this.recipientRepository.findOneBy({ id: recipient.id });
                if (!recipientToUpdate) {
                    throw new Error("It's not possible to update recipient");
                }
                await this.recipientRepository.save(recipient);
            }
        }
        //Update documents
        if (notification.documents) {
            for (const document of notification.documents) {
                documentToUpdate = await this.documentRepository.findOneBy({ id: document.id });
                if (!documentToUpdate) {
                    throw new Error("It's not possible to update document");
                }
                await this.documentRepository.save(document);
            }
        }
        //SAVE CASE
        return this.notificationRepository.save(notification);

    }

    async find(query: PaginateQuery): Promise<Paginated<Notification> | undefined> {
        try {
            return await paginate(query, this.notificationRepository, {
                sortableColumns: [
                    'id',
                    'updatedAt',
                    'createdAt',
                    'toBeSent',
                    'errors',
                    'nextSendingTime',
                    'paProtocolNumber',
                    'subject',
                    'abstract',
                    'taxonomyCode',
                    'notificationFeePolicy',
                    'senderTaxId',
                    'senderDenomination',
                    'group',
                    'physicalCommunicationType',
                    'vat',
                    'paFree',
                    'paymentExpirationDate',
                    'amount',
                    'cancelledIun',
                    'documents',
                    'recipient'
                ],
                filterableColumns: {
                    'id': true,
                    'updatedAt': true,
                    'createdAt': true,
                    'name': true,
                    'code': true,
                    'isEnabled': true,
                    'documents(': true,
                    'recipient(': true
                },
                searchableColumns: ["id", "updatedAt", "createdAt", "toBeSent", "errors", "nextSendingTime", "paProtocolNumber", "subject", "abstract", "taxonomyCode", "notificationFeePolicy",
                    "senderTaxId", "senderDenomination", "group", "physicalCommunicationType", "vat", "paFree", "paymentExpirationDate", "amount", "cancelledIun", "documents", "recipient"],
                select: ["id", "updatedAt", "createdAt", "toBeSent", "errors", "nextSendingTime", "paProtocolNumber", "subject", "abstract", "taxonomyCode", "notificationFeePolicy",
                    "senderTaxId", "senderDenomination", "group", "physicalCommunicationType", "vat", "paFree", "paymentExpirationDate", "amount", "cancelledIun", "documents", "recipient"],
                defaultSortBy: [['id', 'ASC']],
            });
        } catch (e) {
            this.logger.error(e);
            return undefined;
        }
    }
    @Transactional()
    async delete(notificationId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: { documents: true, recipient: true },
        });
        if (!notification)
            throw new Error(`Notification with ID ${notificationId} not found`);
        //da rivedere
        if (notification.documents && notification.documents.length > 0)
            throw new Error(`Notification with ID ${notificationId} cannot be deleted because it has associated document`);
        //Delete
        let result = await this.notificationRepository.delete(notificationId);
        if (result.affected === 0)
            throw new Error(`Notification with ID ${notificationId} not found`);
        return notification;
    }
}