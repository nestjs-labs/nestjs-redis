import type { RedisClients } from './interfaces/index.js';

import { Test, type TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';

import { DEFAULT_REDIS, REDIS_CLIENTS } from './redis.constants.js';
import { RedisService } from './redis.service.js';

jest.mock('ioredis', () => jest.fn(() => ({})));

describe('RedisService', () => {
  let clients: RedisClients;
  let service: RedisService;

  beforeEach(async () => {
    clients = new Map();
    clients.set(DEFAULT_REDIS, new Redis());
    clients.set('client1', new Redis());

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: REDIS_CLIENTS, useValue: clients }, RedisService]
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  test('should get a client with namespace', () => {
    expect(service.getOrThrow('client1')).toBeDefined();
  });

  test('should get default client with namespace', () => {
    expect(service.getOrThrow(DEFAULT_REDIS)).toBeDefined();
  });

  test('should get default client without namespace', () => {
    expect(service.getOrThrow()).toBeDefined();
  });

  test('should return null for unknown namespace', () => {
    expect(service.getOrNil('')).toBeNull();
  });

  test('should throw an error when getting a client with an unknown namespace', () => {
    expect(() => service.getOrThrow('')).toThrow();
  });
});
