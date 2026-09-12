import { HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { REDIS_CLIENT, RedisService } from '@nestjs-labs/nestjs-redis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: {
            getClient: vi.fn(),
            isClusterMode: vi.fn().mockReturnValue(false),
          },
        },
        {
          provide: REDIS_CLIENT,
          useValue: { get: vi.fn() },
        },
        {
          provide: HealthCheckService,
          useValue: { check: vi.fn() },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { checkHealth: vi.fn() },
        },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
