
import { Paginated } from "nestjs-paginate";
import { FileSystemModule } from "../../../shared-modules/file-system/file-system.module";
import { CipherManagerModule } from "../../../shared-modules/cipher-manager/cipher-manager.module";
import { NotificationSchedulerService } from "./notificationScheduler.Service";
import { NotificationService } from "./notification.service";
import { Recipient } from "../entities/recipient.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { NotificationRepository } from "../repositories/notification.repository";
import { Notification } from "../entities/notification.entity";
import { SendService } from "./send.Service";
//mock transactional
jest.mock("typeorm-transactional", () => ({
    Transactional: () => jest.fn()
}));

describe('NotificationSchedulerService', () => {
    let scheduler: NotificationSchedulerService;
    let notificationService: NotificationService;
    let sendService: SendService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
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
                FileSystemModule,
                CipherManagerModule
            ],
            providers: [NotificationSchedulerService, NotificationService, NotificationRepository, SendService]
        }).compile();
        scheduler = module.get<NotificationSchedulerService>(NotificationSchedulerService);
        notificationService = module.get<NotificationService>(NotificationService);
        sendService = module.get<SendService>(SendService);
        process.env.SEND_MAX_SENDING_ATTEMPTS_NUMBER = '3';
        process.env.SEND_SCHEDULER_CRON_EXPRESSION = '*****';
        process.env.API_KEY = "";
        process.env.BASE_URL = "";

    })

    it('should be defined', () => {
        expect(scheduler).toBeDefined();
        expect(notificationService).toBeDefined();
    })

    test('should schedule an email', async () => {
        let notificationData: Notification = {
            toBeSent: true,
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
        let notification = await notificationService.saveOrUpdate(notificationData);
        jest.spyOn(sendService, 'sendNotification').mockImplementation(async (notification: Notification): Promise<boolean> => {
            return true;
        });
        await scheduler.scheduleEmail();
        let response: Paginated<Notification> = await notificationService.find({ path: 'http://localhost:3000' });
        expect(response?.data[0].toBeSent).toBeFalsy();
    });
});