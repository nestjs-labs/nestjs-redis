import { HealthCheckService } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';

import { RedisService } from '@nestjs-labs/nestjs-ioredis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: RedisService, useValue: { getOrThrow: vi.fn() } },
        { provide: HealthCheckService, useValue: { check: vi.fn() } },
        { provide: RedisHealthIndicator, useValue: { checkHealth: vi.fn() } },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});
