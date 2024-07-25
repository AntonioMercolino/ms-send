

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { ClientsManagerService } from './clients-manager.service';
import { ClientsManagerConstants } from '../configs/clients-manager.constants';

describe('ClientsManagerService', () => {
  let service: ClientsManagerService;

  beforeAll(async () => {//executed before all test cases
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        ClientsManagerService,
        {
          provide: ClientsManagerConstants.CLIENT_NAME,
          useValue: {
            emit: jest.fn().mockImplementation(function (topicName, message) {
            }),
            subscribeToResponseOf: jest.fn().mockImplementation(function (topicName) {
            }),
            send: jest.fn().mockImplementation(function (topicName, message) {
              return of({ res: message, error: message.error });
            })
          },
        },
      ],
    }).compile();
    service = module.get<ClientsManagerService>(ClientsManagerService);
  });

  afterAll(async () => {//executed after all test cases

  });

  beforeEach(async () => {//executed before each test case

  });

  afterEach(() => {//executed after each test case

  });

  //TEST CASES
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send sync/async messages to a topic', async () => {
    let topicName: string = 'topicName';
    let message: string = 'message';
    let res1: boolean = await service.sendMessageAsync(topicName, message);
    expect(res1).toBeTruthy();
    let res2: boolean = await service.sendMessageAsync(undefined!, message);
    expect(res2).toBeFalsy();
    let res3 = await service.sendMessageSync(topicName, message);
    expect(res3.res).toBe(message);
    /*let res4 = await service.sendMessageSync(topicName, { error: 'test-error-log' });
    expect(res4).toBe(undefined);*/
  });
});
