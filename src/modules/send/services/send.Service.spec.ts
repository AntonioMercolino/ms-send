
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../entities/notification.entity';
import { Recipient } from '../entities/recipient.entity';
import { Document } from '../entities/document.entity'
import { Configuration, NewNotificationApi } from '../clientAPI/apiClient';
import { Digest } from '../dtos/digest.dto';
import { Ref } from '../dtos/ref.dto';
import { PhysicalAddress } from '../dtos/physicalAddress.dto';
import { DigitalDomicile } from '../dtos/digitalDomicile.dto';
import { SendService } from './send.Service';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'BASE_URL') return 'https://api.notifichedigitali.it';
    if (key === 'API_KEY') return '';
    return null;
  }),
};
const mockNewNotificationApi = {
  sendNewNotificationV23: jest.fn(),
};
const mockSendService = {
  sendNotification: jest.fn(),
};

describe('SendService', () => {
  let service: SendService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NewNotificationApi, useValue: mockNewNotificationApi },
        { provide: Configuration, useValue: { basePath: 'https://api.notifichedigitali.it', apiKey: '' } },
      ],
    }).compile();
    service = module.get<SendService>(SendService);

  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should to be send notification', async () => {
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

    mockNewNotificationApi.sendNewNotificationV23.mockReturnValue(true);
    const respons = await service.sendNotification(notificationData);
    console.log(respons)
    expect(respons).toEqual(true)

  });

  it('should return false when sending notification fails', async () => {

    (mockSendService.sendNotification as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    const notificationData: Notification = {
      toBeSent: false,
      errors: [],
      nextSendingTime: new Date(),
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
      paymentExpirationDate: " ",
      amount: 0,
      cancelledIun: "123",
      documents: [],
      recipient: [],
      pagoPaIntMode: ""
    };
    try {
      const response = await service.sendNotification(notificationData);
      expect(response).toEqual(false);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

