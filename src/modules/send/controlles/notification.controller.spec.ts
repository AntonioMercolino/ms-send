import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "../entities/notification.entity";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { NotificationService } from "../services/notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationRepository } from "../repositories/notification.repository";
import { DocumentRepository } from "../repositories/document.repository";
import { RecipientRepository } from "../repositories/recipient.repository";
import { Recipient } from "../entities/recipient.entity";
import { Document } from "../entities/document.entity";


jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('NotificationService', () => {
    let notificationController : NotificationController;
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
        controllers: [
            NotificationController
        ],
        providers: [
          NotificationService,
          NotificationRepository,
          RecipientRepository,
          DocumentRepository
          
        ],
      }).compile();
      notificationController = module.get<NotificationController>(NotificationController);
      notificationService = module.get<NotificationService>(NotificationService);
      notificationRepository = module.get<NotificationRepository>(NotificationRepository);
      recipientRepository = module.get<RecipientRepository>(RecipientRepository);
      documentRepository = module.get<DocumentRepository>(DocumentRepository);
    });
  
    it('should be defined', () => {
        expect(notificationController).toBeDefined();
      expect(notificationService).toBeDefined();
      expect(notificationRepository).toBeDefined();
      expect(recipientRepository).toBeDefined();
      expect(documentRepository).toBeDefined();
    });
  
    // SAVE OR UPDATE
    it('should execute saveOrUpdate controller and return a message', async () => {
        jest.spyOn(notificationService, "saveOrUpdate").mockImplementation(async (notification: Notification): Promise<Notification> => {
            return {} as Notification;
        });
        let message: Notification  = await notificationController.seveOrUpdate({} as Notification);
        expect(message).toBeDefined();
    });

    // FIND
    it('should execute find controller and return a message', async () => {
        jest.spyOn(notificationService, "find").mockImplementation(async (query: PaginateQuery): Promise<Paginated<Notification>> => {
            return {} as Paginated<Notification>;
        });
        let message: Paginated<Notification> = await notificationController.find({} as PaginateQuery);
        expect(message).toBeDefined();
    });

    // DELETE
    it('should execute delete controller and return a message', async () => {
        jest.spyOn(notificationService, "delete").mockImplementation(async (notificationId: string): Promise<Notification> => {
            return {} as Notification;
        });
        let message: Notification = await notificationController.delete("");
        expect(message).toBeDefined();
    });

    it('Find Test for Notification', async () => {
        // test 1
        let query1: PaginateQuery = { path: "http://localhost", filter: { "method": "POST" }, select: ["id", "content", "title"] };
        let message: Paginated<Notification> = await notificationController.find(query1);
        expect(message).toBeDefined();
        
        // test 2
        jest.spyOn(notificationService, 'find').mockResolvedValueOnce(undefined!);
        let query2: PaginateQuery = { path: "http://localhost", filter: { "method": "POST" }, select: ["id", "content", "title"] };
        let message2: Paginated<Notification>  = await notificationController.find(query2);
        expect(message2).toBeUndefined();
    });

});
