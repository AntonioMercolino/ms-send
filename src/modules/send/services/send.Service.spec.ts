
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SendService } from './send.Service';
import { Notification } from '../entities/notification.entity';
import { Recipient } from '../entities/recipient.entity';
import { DigestDTO } from '../dtos/digest.dto';
import { RefDTO } from '../dtos/ref.dto';
import { PhysicalAddressDTO } from '../dtos/physicalAdress.dto';
import { DigitalDomicileDTO } from '../dtos/digitalDomicile.dto';
import { Document } from '../entities/document.entity'
import { Configuration } from '../clientAPI/apiClient';

const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'BASE_URL') return 'http://example.com';
      if (key === 'API_KEY') return '123456';
      return null;
    }),
  };
  
  const mockNotificationRepository = {
    find: jest.fn().mockResolvedValue([
      { id: 1, toBeSent: true },
      { id: 2, toBeSent: true },
    ]),
    save: jest.fn(),
  };
  
  const mockSendService = {
    sendNotification: jest.fn().mockResolvedValue(true),
  };
  

describe('SendService', () => {
  let service: SendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SendService, useValue: mockSendService },
        { provide: Configuration, useValue: { basePath: '', apiKey: '' } },
      ],
    }).compile();
    service = module.get<SendService>(SendService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it ('should to be send notification', async () => {
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
        physicalAddress: new PhysicalAddressDTO,
        digitalDomicile: new DigitalDomicileDTO,
        payments: [],
        notificationId: notificationData
      }
      let documentData: Document = {
        path: "TEST",
        contentType: "TEST",
        digests: new DigestDTO,
        ref: new RefDTO,
        title: "TEST",
        url: "TEST",
        httpMethod: "TEST",
        secret: "TEST",
        notificationId: notificationData,
        docIdx: ""
      }
      const respons = await service.sendNotification(notificationData);
      expect(respons).toEqual(true)
  });
});
