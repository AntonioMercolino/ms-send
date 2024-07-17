import { Test } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Recipient } from "../entities/recipient.entity";
import { Notification } from "../entities/notification.entity";

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
        physicalAddress: new PhysicalAddress,
        digitalDomicile: new DigitalDomicile,
        notificationId: "",
        payments: new Payment
    }


    let notificationData: Notification = {
        toBeSent: false,
        errors: [],
        nextSendingTime: new Date,
        paProtocolNumber: "123",
        subject: "",
        abstract: "",
        taxonomyCode: "",
        notificationFeePolicy: "",
        senderTaxId: "",
        senderDenomination: "",
        group: "",
        physicalCommunicationType: "",
        vat: 0,
        paFree: 0,
        paymentExpirationDate: "",
        amount: 0,
        cancelledIun: "",
        recipient: [recipient],
        documents: []
    })

  })
