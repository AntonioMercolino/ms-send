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
jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
  }));
  describe('NotificationService', () => {
    let notificationService: NotificationService;
    
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                //create an in-memory datastore for testing repository access
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [Notification, Document, Recipient],
                    logging: false,
                    dropSchema: true,
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([Notification, Document, Recipient]),//register db entities
            ],
            providers: [NotificationService],
        }).compile();
        notificationService = module.get<NotificationService>(NotificationService);
    });
    it('should be defined', () => {
        expect(notificationService).toBeDefined();

});

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
    })

  })
