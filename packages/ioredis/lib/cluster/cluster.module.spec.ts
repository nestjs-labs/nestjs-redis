import type { ModuleRef } from '@nestjs/core';
import type { ClusterModuleAsyncOptions } from './interfaces/index.js';

import { vi } from 'vitest';

import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS } from './cluster.constants.js';
import { ClusterModule } from './cluster.module.js';
import { logger } from './cluster-logger.js';

vi.mock('./cluster-logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('ClusterModule', () => {
  test('registers synchronously', () => {
    const module = ClusterModule.forRoot({ config: { nodes: [] } });

    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.providers).toHaveLength(4);
    expect(module.exports).toEqual([expect.any(Function)]);
  });

  test('registers asynchronously with extra providers', () => {
    const options: ClusterModuleAsyncOptions = {
      extraProviders: [{ provide: 'extra', useValue: true }],
      imports: [],
      inject: [],
      useFactory: () => ({ config: { nodes: [] } })
    };
    const module = ClusterModule.forRootAsync(options);

    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.imports).toEqual([]);
    expect(module.providers).toHaveLength(5);
    expect(module.exports).toEqual([expect.any(Function)]);
  });

  test('rejects an asynchronous registration without a factory', () => {
    expect(() => ClusterModule.forRootAsync({})).toThrow();
  });

  test('closes clients on application shutdown', async () => {
    const client = {
      disconnect: vi.fn(),
      quit: vi.fn().mockRejectedValue(new Error('quit failed')),
      status: 'ready'
    };
    const moduleRef = {
      get: vi.fn((token: unknown) => {
        if (token === CLUSTER_MERGED_OPTIONS) return { closeClient: true };
        if (token === CLUSTER_CLIENTS) return new Map([['default', client]]);

        return undefined;
      })
    } as unknown as ModuleRef;
    const module = new ClusterModule(moduleRef);

    await module.onApplicationShutdown();

    expect(client.quit).toHaveBeenCalledTimes(1);
    expect(client.disconnect).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
