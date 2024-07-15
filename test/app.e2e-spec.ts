import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;

  beforeAll(async () => {//executed before all test cases
    moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {//executed after all test cases
    await app.close();
    await moduleFixture.close();
  });

  beforeEach(async () => {//executed before each test case

  });

  afterEach(async () => {//executed after each test case

  });
});
