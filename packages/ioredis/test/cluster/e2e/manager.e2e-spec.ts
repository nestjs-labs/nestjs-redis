import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TestingModule } from '@nestjs/testing';

import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('ManagerController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('/manager (GET)', async () => {
    const res = await app.inject({ method: 'GET', url: '/manager' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toIncludeSameMembers(['PONG', 'PONG']);
  });
});
