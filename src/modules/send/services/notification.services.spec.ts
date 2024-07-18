import { Test } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Recipient } from "../entities/recipient.entity";
import { Notification } from "../entities/notification.entity";
import { PaymentDTO } from "../dtos/payment.dto";
import { DigitalDomicileDTO } from "../dtos/digitalDomicile.dto";
import { PhysicalAddressDTO } from "../dtos/physicalAdress.dto";
import { Document } from "../entities/document.entity"
import { DigestDTO } from "../dtos/digest.dto";
import { RefDTO } from "../dtos/ref.dto";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { NotificationRepository } from "../repositories/notification.repository";
import { DocumentRepository } from "../repositories/document.repository";
import { RecipientRepository } from "../repositories/recipient.repository";
import { AttachmentDTO } from "../dtos/attachment.dto";
import { F24DTO } from "../dtos/f24.dto";
import { PagoPaDTO } from "../dtos/pagoPa.dto";


jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));
describe('NotificationService', () => {
    let notificationService: NotificationService;
    let notificationRepository: NotificationRepository;
    //  let documentRepository: DocumentRepository;
    // let recipientRepository: RecipientRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                //create an in-memory datastore for testing repository access
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory',
                    entities: [Notification, Document, Recipient],
                    logging: true,
                    dropSchema: true,
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([Notification, Document, Recipient ]),//register db entities
            ],
            providers: [NotificationService],
        }).compile();
        notificationService = module.get<NotificationService>(NotificationService);
        notificationRepository = module.get<NotificationRepository>(NotificationRepository);

    });
    it('should be defined', () => {
        expect(notificationService).toBeDefined();
        //expect(notificationRepository).toBeDefined();

    });
    /*
    //SAVE OR UPDDATE
    it('Should save or update an Country', async () => {
    
    
    
        let recipient: Recipient = {
            taxId: "",
            denomination: "",
            recipientType: "",
            internalId: "",
            physicalAddress: new PhysicalAddressDTO,
            digitalDomicile: new DigitalDomicileDTO,
            notificationId: "",
            payments: new PaymentDTO
        }
      
        let document: Document= {
            path: "",
            contentType: "",
            digests: new DigestDTO,
            ref: new RefDTO,
            title: "",
            url: "",
            httpMethod: "",
            secret: ""
        }
    
        let notificationData: Notification = {
            toBeSent: false,
            errors: [],
            nextSendingTime: new Date,
            paProtocolNumber: "123",
            subject: "122",
            abstract: "222",
            taxonomyCode: "333",
            notificationFeePolicy: "FAKE",
            senderTaxId: "543",
            senderDenomination: "FF",
            group: "AA",
            physicalCommunicationType: "SC",
            vat: 0,
            paFree: 0,
            paymentExpirationDate: "FA",
            amount: 0,
            cancelledIun: "123",
            recipient: [recipient],
            documents: [document]
        };
        let notification: Notification | undefined = await notificationService.saveOrUpdate(notificationData);
                expect(notification).toBeDefined();
        });
        //FIND
        it('should find and return Notification', async () => {
            
            let recipient: Recipient = {
                taxId: "",
                denomination: "",
                recipientType: "",
                internalId: "",
                physicalAddress: new PhysicalAddressDTO,
                digitalDomicile: new DigitalDomicileDTO,
                notificationId: "",
                payments: new PaymentDTO
            }
            let notificationData: Notification = {
                toBeSent: false,
                errors: [],
                nextSendingTime: new Date,
                paProtocolNumber: "123",
                subject: "122",
                abstract: "222",
                taxonomyCode: "333",
                notificationFeePolicy: "FAKE",
                senderTaxId: "543",
                senderDenomination: "FF",
                group: "AA",
                physicalCommunicationType: "SC",
                vat: 0,
                paFree: 0,
                paymentExpirationDate: "FA",
                amount: 0,
                cancelledIun: "123",
                recipient: [recipient]
            };
            
            
            let notification: Notification | undefined = await notificationService.saveOrUpdate(notificationData);
            let query: PaginateQuery = { path: 'http://localhost',filter:{paProtocolNumber:"$ilike:123"}, select:['id']};
            let notifications: Paginated<Notification> | undefined = await notificationService.find(query);
            expect(notification).toBeDefined();
            expect(notifications?.data.length).toEqual(1);
        });
         // DELETE if the notification has associated document  @return: undefined
         it('not should delete a notification if has associated regions', async () => {
    
            let document: Document= {
                path: "",
                contentType: "",
                digests: new DigestDTO,
                ref: new RefDTO,
                title: "",
                url: "",
                httpMethod: "",
                secret: ""
            }
            let recipient: Recipient = {
                taxId: "",
                denomination: "",
                recipientType: "",
                internalId: "",
                physicalAddress: new PhysicalAddressDTO,
                digitalDomicile: new DigitalDomicileDTO,
                notificationId: "",
                payments: new PaymentDTO
            }
            let notificationData: Notification = {
                toBeSent: false,
                errors: [],
                nextSendingTime: new Date,
                paProtocolNumber: "123",
                subject: "122",
                abstract: "222",
                taxonomyCode: "333",
                notificationFeePolicy: "FAKE",
                senderTaxId: "543",
                senderDenomination: "FF",
                group: "AA",
                physicalCommunicationType: "SC",
                vat: 0,
                paFree: 0,
                paymentExpirationDate: "FA",
                amount: 0,
                cancelledIun: "123",
                recipient: [recipient]
            };
             // Salva la notifica e il documento associato
        let savedNotification: Notification | undefined = await notificationService.saveOrUpdate(notificationData);
        
        
        expect(savedNotification).toBeDefined();
        
    
        if (savedNotification?.id && document?.id) {
          // Associa il documento alla notifica (questa parte dipende dalla tua logica applicativa)
          savedNotification.documents = [document];
    
          // Tenta di eliminare la notifica
          await expect(notificationService.delete(savedNotification.id)).rejects.toThrow(new Error(`Notification with ID ${savedNotification.id} cannot be deleted because it has associated documents`));
        }
    
        });
    */
})
