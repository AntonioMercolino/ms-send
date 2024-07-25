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
import { Index } from "typeorm";


@Injectable()
export class NotificationService {
    
    constructor(
        @InjectRepository(NotificationRepository)
        private readonly notificationRepository: NotificationRepository,
        @InjectRepository(RecipientRepository)
        private readonly recipientRepository: RecipientRepository,
        @InjectRepository(DocumentRepository)
        private readonly documentRepository: DocumentRepository
    ) { }
    
    /**
     * This method given an Notification, can save or update an Notification record.
     * If an id is defined in the Notification parameter, this service will attempt to update an existing record having this id,
     * otherwise, a new record will be created.
     * 
     * @param notification Notification
     * @returns Promise<Notification>
     * @example
     * let newNotification: Notification = await this.notificationService.saveOrUpdate(notificationToSave);
     * 
     * UPDATE fails if:
     *  -there is no record with the specified id;
     */
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
            return await this.notificationRepository.save(notification);
        } else {
            if (notification.recipient) {
                for (const recipient of notification.recipient) {
                    let recipientSave = await this.recipientRepository.save(recipient);
                    if (!recipientSave) {
                        throw new Error("It's not possible to Save recipient id: " + recipient.id);
                    }
                }
            }
            if (notification.documents) {
                for (const document of notification.documents) {
                    let documentSave = await this.documentRepository.save(document);
                    if (!documentSave) {
                        throw new Error("It's not possible to Save document id: " + document.id);
                    }
                }
            }
            //SAVE CASE
            return this.notificationRepository.save(notification);
        }
    }
     /**
     * This method, given a PaginatedQuery, finds and returns a paginated list of Notification that match the PaginatedQuery filters.
     * 
     * @param query PaginateQuery
     * @returns Promise<Paginated<Notification>>>
     * @example
     * let response: Paginated<Notification>> = await this.notificationService.find({ path: 'http://localhost',filter:{"name":"$ilike:USER"}, select:['id']});
     */

    async find(query: PaginateQuery): Promise<Paginated<Notification>> {
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
                    'paFee',
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
                searchableColumns: [],
                select: [],
                defaultSortBy: [['id', 'ASC']],
            });
    }
    /**
     * This method, deleted a row on database
     * 
     * @param notificationId 
     * @returns Promise<Notification>>
     * @example
     * 
     */
    @Transactional()
    async delete(notificationId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: { documents: true, recipient: true },
        });
        if (!notification)
            throw new Error(`Notification with ID ${notificationId} not found`);
        //Delete
        let result = await this.notificationRepository.delete(notificationId);
        if (result.affected === 0)
            throw new Error(`Notification with ID ${notificationId} not found`);
        return notification;
    }
}