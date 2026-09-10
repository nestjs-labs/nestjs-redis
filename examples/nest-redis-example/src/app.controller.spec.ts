import type { TestingModule } from '@nestjs/testing';

import { HealthCheckService } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';

import { REDIS_CLIENT, RedisService } from '@nestjs-labs/nestjs-redis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockRedisClient = {
    get: jest.fn().mockResolvedValue('Hello from Redis!'),
    set: jest.fn().mockResolvedValue('OK'),
  };

  const mockRedisService = {
    getClient: jest.fn().mockReturnValue(mockRedisClient),
  };

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockRedisHealthIndicator = {
    checkHealth: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: RedisHealthIndicator,
          useValue: mockRedisHealthIndicator,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello from Redis!"', async () => {
      const result = await appController.getHello();

      expect(result).toBe('Hello from Redis!');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test-key',
        'Hello from Redis!',
      );
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });
  });
});
