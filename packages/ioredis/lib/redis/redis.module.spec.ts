import type { ModuleRef } from '@nestjs/core';
import type { RedisModuleAsyncOptions } from './interfaces/index.js';

import { vi } from 'vitest';

import { removeListeners } from './common/index.js';
import { REDIS_CLIENTS, REDIS_MERGED_OPTIONS } from './redis.constants.js';
import { RedisModule } from './redis.module.js';
import { logger } from './redis-logger.js';

vi.mock('./common/index.js', () => ({
  removeListeners: vi.fn()
}));
vi.mock('./redis-logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('RedisModule', () => {
  test('registers synchronously', () => {
    const module = RedisModule.forRoot();

    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.providers).toHaveLength(4);
    expect(module.exports).toEqual([expect.any(Function)]);
  });

  test('registers asynchronously with extra providers', () => {
    const options: RedisModuleAsyncOptions = {
      extraProviders: [{ provide: 'extra', useValue: true }],
      imports: [],
      inject: [],
      useFactory: () => ({})
    };
    const module = RedisModule.forRootAsync(options);

    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.imports).toEqual([]);
    expect(module.providers).toHaveLength(5);
    expect(module.exports).toEqual([expect.any(Function)]);
  });

  test('rejects an asynchronous registration without a factory', () => {
    expect(() => RedisModule.forRootAsync({})).toThrow();
  });

  test('closes clients on application shutdown', async () => {
    const client = {
      quit: vi.fn().mockRejectedValue(new Error('quit failed')),
      status: 'ready'
    };
    const moduleRef = {
      get: vi.fn((token: unknown) => {
        if (token === REDIS_MERGED_OPTIONS) return { closeClient: true };
        if (token === REDIS_CLIENTS) return new Map([['default', client]]);

        return undefined;
      })
    } as unknown as ModuleRef;
    const module = new RedisModule(moduleRef);

    await module.onApplicationShutdown();

    expect(client.quit).toHaveBeenCalledTimes(1);
    expect(removeListeners).toHaveBeenCalledWith(client);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
