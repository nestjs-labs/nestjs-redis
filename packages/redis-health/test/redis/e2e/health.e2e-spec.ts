import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TestingModule } from '@nestjs/testing';

import { Module } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

// Mock HealthCheckService for testing
class MockHealthCheckService {
  check() {
    return Promise.resolve({ status: 'ok', info: {}, error: {}, details: {} });
  }
}

// Mock TerminusModule to avoid TypeOrmHealthIndicator ModuleRef issue
@Module({
  exports: [HealthCheckService],
  imports: [],
  providers: [{ provide: HealthCheckService, useClass: MockHealthCheckService }]
})
class MockTerminusModule {}

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideModule(TerminusModule)
      .useModule(MockTerminusModule)
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('/health (GET)', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      details: {
        client1: {
          status: 'up'
        },
        default: {
          status: 'up'
        }
      },
      error: {},
      info: {
        client1: {
          status: 'up'
        },
        default: {
          status: 'up'
        }
      },
      status: 'ok'
    });
  });
});
