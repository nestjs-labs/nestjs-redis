import type { ModuleRef } from '@nestjs/core';
import type { RedisModuleAsyncOptions } from './interfaces/index.js';

import { removeListeners } from './common/index.js';
import { REDIS_CLIENTS, REDIS_MERGED_OPTIONS } from './redis.constants.js';
import { RedisModule } from './redis.module.js';
import { logger } from './redis-logger.js';

jest.mock('./common', () => ({
  removeListeners: jest.fn()
}));
jest.mock('./redis-logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('forRoot', () => {
  test('should work correctly', () => {
    const module = RedisModule.forRoot();

    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });
});

describe('forRootAsync', () => {
  test('should work correctly', () => {
    const options: RedisModuleAsyncOptions = {
      extraProviders: [{ provide: '', useValue: '' }],
      imports: [],
      inject: [],
      useFactory: () => ({})
    };
    const module = RedisModule.forRootAsync(options);

    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.imports).toBeArray();
    expect(module.providers?.length).toBeGreaterThanOrEqual(5);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });

  test('without extraProviders', () => {
    const options: RedisModuleAsyncOptions = {
      useFactory: () => ({})
    };
    const module = RedisModule.forRootAsync(options);

    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
  });

  test('should throw an error', () => {
    expect(() => RedisModule.forRootAsync({})).toThrow();
  });
});

describe('onApplicationShutdown', () => {
  const mockRemoveListeners = removeListeners as jest.MockedFunction<typeof removeListeners>;
  const mockError = jest.spyOn(logger, 'error');

  beforeEach(() => {
    mockRemoveListeners.mockClear();
    mockError.mockClear();
  });

  test('should work correctly', async () => {
    const mockQuit = jest.fn().mockRejectedValue(new Error('quit failed'));
    const client = { quit: mockQuit, status: 'ready' };

    const module = new RedisModule({
      get: (token: unknown) => {
        if (token === REDIS_MERGED_OPTIONS) return { closeClient: true };
        if (token === REDIS_CLIENTS) return new Map([['default', client]]);

        return undefined;
      }
    } as ModuleRef);

    await module.onApplicationShutdown();
    expect(mockQuit).toHaveBeenCalledTimes(1);
    expect(mockRemoveListeners).toHaveBeenCalledWith(client);
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});
