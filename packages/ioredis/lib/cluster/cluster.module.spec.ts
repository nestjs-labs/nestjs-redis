import type { ModuleRef } from '@nestjs/core';
import type { ClusterModuleAsyncOptions } from './interfaces/index.js';

import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS } from './cluster.constants.js';
import { ClusterModule } from './cluster.module.js';
import { logger } from './cluster-logger.js';

jest.mock('./cluster-logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('forRoot', () => {
  test('should work correctly', () => {
    const module = ClusterModule.forRoot({ config: { nodes: [] } });

    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });
});

describe('forRootAsync', () => {
  test('should work correctly', () => {
    const options: ClusterModuleAsyncOptions = {
      extraProviders: [{ provide: '', useValue: '' }],
      imports: [],
      inject: [],
      useFactory: () => ({ config: { nodes: [] } })
    };
    const module = ClusterModule.forRootAsync(options);

    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.imports).toBeArray();
    expect(module.providers?.length).toBeGreaterThanOrEqual(5);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });

  test('without extraProviders', () => {
    const options: ClusterModuleAsyncOptions = {
      useFactory: () => ({ config: { nodes: [] } })
    };
    const module = ClusterModule.forRootAsync(options);

    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
  });

  test('should throw an error', () => {
    expect(() => ClusterModule.forRootAsync({})).toThrow();
  });
});

describe('onApplicationShutdown', () => {
  const mockError = jest.spyOn(logger, 'error');

  beforeEach(() => {
    mockError.mockClear();
  });

  test('should work correctly', async () => {
    const mockQuit = jest.fn().mockRejectedValue(new Error('quit failed'));
    const client = { disconnect: jest.fn(), quit: mockQuit, status: 'ready' };

    const module = new ClusterModule({
      get: (token: unknown) => {
        if (token === CLUSTER_MERGED_OPTIONS) return { closeClient: true };
        if (token === CLUSTER_CLIENTS) return new Map([['default', client]]);

        return undefined;
      }
    } as ModuleRef);

    await module.onApplicationShutdown();
    expect(mockQuit).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});
