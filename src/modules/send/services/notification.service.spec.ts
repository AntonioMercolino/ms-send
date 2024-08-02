import { Test } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Recipient } from "../entities/recipient.entity";
import { Notification } from "../entities/notification.entity";
import { Document } from "../entities/document.entity"
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { NotificationRepository } from "../repositories/notification.repository";
import { DocumentRepository } from "../repositories/document.repository";
import { RecipientRepository } from "../repositories/recipient.repository";
import { PhysicalAddress } from "../dtos/physicalAddress.dto";
import { DigitalDomicile } from "../dtos/digitalDomicile.dto";
import { Digest } from "../dtos/digest.dto";
import { Ref } from "../dtos/ref.dto";


jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));
describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationRepository: NotificationRepository;
  let recipientRepository: RecipientRepository;
  let documentRepository: DocumentRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:', // Utilizza un database in memoria
          entities: [Notification, Document, Recipient],
          logging: false,
          dropSchema: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Notification, Document, Recipient]),
      ],
      providers: [
        NotificationService,
        NotificationRepository,
        RecipientRepository,
        DocumentRepository,
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);
    recipientRepository = module.get<RecipientRepository>(RecipientRepository);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
  });
    
  it('should be defined', () => {
    expect(notificationService).toBeDefined();
    expect(notificationRepository).toBeDefined();
    expect(recipientRepository).toBeDefined();
    expect(documentRepository).toBeDefined();
  });

  //SAVE OR UPDDATE
  it('Should save or update an notification', async () => {
    /**
         * @case SAVE where the record is saved Successfully
         * @return Notification
         */
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
      paFee: 0,
      paymentExpirationDate: "FA",
      amount: 0,
      cancelledIun: "123",
      documents: [],
      recipient: [],
      pagoPaIntMode: ""
    };
    let recipientData: Recipient = {
      taxId: "TEST Recipient",
      denomination: "TEST Recipient",
      recipientType: "TEST Recipient",
      internalId: "TEST Recipient",
      physicalAddress: new PhysicalAddress,
      digitalDomicile: new DigitalDomicile,
      payments: [],
      notification: notificationData
    }
    let documentData: Document = {
      path: "TEST",
      contentType: "TEST",
      digests: new Digest,
      ref: new Ref,
      title: "TEST",
      url: "TEST",
      httpMethod: "TEST",
      secret: "TEST",
      notification: notificationData,
      docIdx: ""
    }
    notificationData.documents = [documentData];
    notificationData.recipient = [recipientData];
    let notification: Notification = await notificationService.saveOrUpdate(notificationData);
    expect(notification).toBeDefined();

    notification.subject = "TestUpdate"
    recipientData.taxId = "TestUpdate";
    documentData.path = "Update";
    notification.documents = [documentData];
    notification.recipient = [recipientData];
    let notificationUpdate: Notification = await notificationService.saveOrUpdate(notification);
    expect(notificationUpdate).toBeDefined();
  });
  //FIND
  it('should find and return Notification', async () => {
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
      paFee: 0,
      paymentExpirationDate: "FA",
      amount: 0,
      cancelledIun: "123",
      documents: [],
      recipient: [],
      pagoPaIntMode: ""
    };
    let recipientData: Recipient = {
      taxId: "TEST Recipient",
      denomination: "TEST Recipient",
      recipientType: "TEST Recipient",
      internalId: "TEST Recipient",
      physicalAddress: new PhysicalAddress,
      digitalDomicile: new DigitalDomicile,
      payments: [],
      notification: notificationData
    }
    let documentData: Document = {
      path: "TEST",
      contentType: "TEST",
      digests: new Digest,
      ref: new Ref,
      title: "TEST",
      url: "TEST",
      httpMethod: "TEST",
      secret: "TEST",
      notification: notificationData,
      docIdx: ""
    }
    notificationData.documents = [documentData];
    notificationData.recipient = [recipientData];
    let notification: Notification = await notificationService.saveOrUpdate(notificationData);
    expect(notification).toBeDefined();
    let query: PaginateQuery = { path: 'http://localhost', filter: { paProtocolNumber: "$ilike:123" }, select: [] };
    let notifications: Paginated<Notification> = await notificationService.find(query);
    expect(notification).toBeDefined();
    expect(notifications?.data.length).toEqual(1);
  });
  // DELETE if the notification has associated document  @return: undefined
  it('not should delete a notification', async () => {
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
      paFee: 0,
      paymentExpirationDate: "FA",
      amount: 0,
      cancelledIun: "123",
      documents: [],
      recipient: [],
      pagoPaIntMode: ""
    };
    let recipientData: Recipient = {
      taxId: "TEST Recipient",
      denomination: "TEST Recipient",
      recipientType: "TEST Recipient",
      internalId: "TEST Recipient",
      physicalAddress: new PhysicalAddress,
      digitalDomicile: new DigitalDomicile,
      payments: [],
      notification: notificationData
    }
    let documentData: Document = {
      path: "TEST",
      contentType: "TEST",
      digests: new Digest,
      ref: new Ref,
      title: "TEST",
      url: "TEST",
      httpMethod: "TEST",
      secret: "TEST",
      notification: notificationData,
      docIdx: ""
    }
    notificationData.documents = [documentData];
    notificationData.recipient = [recipientData];
    let notification: Notification = await notificationService.saveOrUpdate(notificationData);
    //DELETE
    if (notification.id) {
      let notificationDelete = await notificationService.delete(notification.id);
      expect(notificationDelete).toBeDefined();
      expect(notificationDelete!.id).toEqual(notification.id);
    }
  });
})
