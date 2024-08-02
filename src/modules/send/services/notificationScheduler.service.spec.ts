import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRepository } from '../repositories/notification.repository';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../entities/notification.entity';
import { Configuration } from '../clientAPI/apiClient';
import { NotificationSchedulerService } from './notificationScheduler.Service';
import { SendService } from './send.service';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'BASE_URL') return 'http://example.com';
    if (key === 'API_KEY') return '123456';
    return null;
  }),
};

const mockNotificationRepository = {
  find: jest.fn(),
  save: jest.fn(),
};
const mockSendService = {
  sendNotification: jest.fn(),
};

describe('NotificationSchedulerService', () => {
  let service: NotificationSchedulerService;
  let notificationRepository: NotificationRepository;
  let sendService: SendService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSchedulerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationRepository, useValue: mockNotificationRepository },
        { provide: SendService, useValue: mockSendService },
        { provide: Configuration, useValue: { basePath: '', apiKey: '' } },
      ],
    }).compile();
    service = module.get<NotificationSchedulerService>(NotificationSchedulerService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);
    sendService = module.get<SendService>(SendService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send notifications', async () => {
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
    const mockNotifications: Notification[] = [
      notificationData
    ];

    mockNotificationRepository.find.mockResolvedValue(mockNotifications);
    mockSendService.sendNotification.mockResolvedValue(true);
    await service.scheduleNotification();
    expect(mockNotificationRepository.find).toHaveBeenCalledWith({
      where: { toBeSent: true },
    });

    for (const notification of mockNotifications) {
      expect(mockSendService.sendNotification).toHaveBeenCalledWith(notification);
      expect(notification.toBeSent).toBe(false);
      expect(mockNotificationRepository.save).toHaveBeenCalledWith(notification);
    }
  });
});
