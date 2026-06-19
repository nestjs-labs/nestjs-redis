import type { ClusterModuleAsyncOptions, ClusterModuleOptions, ClusterOptionsFactory } from './interfaces/index.js';

import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS, CLUSTER_OPTIONS } from './cluster.constants.js';
import {
  clusterClientsProvider,
  createAsyncOptions,
  createAsyncOptionsProvider,
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider
} from './cluster.providers.js';
import { defaultClusterModuleOptions } from './default-options.js';

jest.mock('ioredis', () => ({
  Cluster: jest.fn(() => ({}))
}));

describe('createOptionsProvider', () => {
  test('should work correctly', () => {
    expect(createOptionsProvider({ config: { nodes: [] } })).toEqual({
      provide: CLUSTER_OPTIONS,
      useValue: { config: { nodes: [] } }
    });
  });
});

describe('createAsyncProviders', () => {
  class ClusterConfigService implements ClusterOptionsFactory {
    createClusterOptions(): ClusterModuleOptions {
      return { config: { nodes: [] } };
    }
  }

  test('with useFactory', () => {
    const result = createAsyncProviders({ inject: [], useFactory: () => ({ config: { nodes: [] } }) });

    expect(result).toHaveLength(1);
    expect(result).toPartiallyContain({ inject: [], provide: CLUSTER_OPTIONS });
    expect(result[0]).toHaveProperty('useFactory');
  });

  test('with useClass', () => {
    const result = createAsyncProviders({ useClass: ClusterConfigService });

    expect(result).toHaveLength(2);
    expect(result).toIncludeAllPartialMembers([
      { provide: ClusterConfigService, useClass: ClusterConfigService },
      { inject: [ClusterConfigService], provide: CLUSTER_OPTIONS }
    ]);
    expect(result[1]).toHaveProperty('useFactory');
  });

  test('with useExisting', () => {
    const result = createAsyncProviders({ useExisting: ClusterConfigService });

    expect(result).toHaveLength(1);
    expect(result).toIncludeAllPartialMembers([{ inject: [ClusterConfigService], provide: CLUSTER_OPTIONS }]);
    expect(result[0]).toHaveProperty('useFactory');
  });

  test('without options', () => {
    const result = createAsyncProviders({});

    expect(result).toHaveLength(0);
  });
});

describe('createAsyncOptions', () => {
  test('should work correctly', async () => {
    const clusterConfigService: ClusterOptionsFactory = {
      createClusterOptions(): ClusterModuleOptions {
        return { closeClient: true, config: { nodes: [] } };
      }
    };

    await expect(createAsyncOptions(clusterConfigService)).resolves.toEqual({
      closeClient: true,
      config: { nodes: [] }
    });
  });
});

describe('createAsyncOptionsProvider', () => {
  class ClusterConfigService implements ClusterOptionsFactory {
    createClusterOptions(): ClusterModuleOptions {
      return { config: { nodes: [] } };
    }
  }

  test('with useFactory', () => {
    const options: ClusterModuleAsyncOptions = { inject: ['token'], useFactory: () => ({ config: { nodes: [] } }) };

    expect(createAsyncOptionsProvider(options)).toEqual({ provide: CLUSTER_OPTIONS, ...options });
  });

  test('with useClass', () => {
    const options: ClusterModuleAsyncOptions = { useClass: ClusterConfigService };

    expect(createAsyncOptionsProvider(options)).toHaveProperty('provide', CLUSTER_OPTIONS);
    expect(createAsyncOptionsProvider(options)).toHaveProperty('useFactory');
    expect(createAsyncOptionsProvider(options)).toHaveProperty('inject', [ClusterConfigService]);
  });

  test('with useExisting', () => {
    const options: ClusterModuleAsyncOptions = { useExisting: ClusterConfigService };

    expect(createAsyncOptionsProvider(options)).toHaveProperty('provide', CLUSTER_OPTIONS);
    expect(createAsyncOptionsProvider(options)).toHaveProperty('useFactory');
    expect(createAsyncOptionsProvider(options)).toHaveProperty('inject', [ClusterConfigService]);
  });

  test('without options', () => {
    expect(createAsyncOptionsProvider({})).toEqual({ provide: CLUSTER_OPTIONS, useValue: {} });
  });
});

describe('clusterClientsProvider', () => {
  test('should be a dynamic module', () => {
    expect(clusterClientsProvider).toHaveProperty('provide', CLUSTER_CLIENTS);
    expect(clusterClientsProvider).toHaveProperty('useFactory');
    expect(clusterClientsProvider).toHaveProperty('inject', [CLUSTER_MERGED_OPTIONS]);
  });

  test('with multiple clients', async () => {
    const options: ClusterModuleOptions = { config: [{ nodes: [] }, { namespace: 'client1', nodes: [] }] };
    const clients = await clusterClientsProvider.useFactory(options);

    expect(clients.size).toBe(2);
  });

  describe('with single client', () => {
    test('with namespace', async () => {
      const options: ClusterModuleOptions = { config: { namespace: 'client1', nodes: [] } };
      const clients = await clusterClientsProvider.useFactory(options);

      expect(clients.size).toBe(1);
    });

    test('without namespace', async () => {
      const options: ClusterModuleOptions = { config: { nodes: [] } };
      const clients = await clusterClientsProvider.useFactory(options);

      expect(clients.size).toBe(1);
    });
  });
});

describe('mergedOptionsProvider', () => {
  test('should be a dynamic module', () => {
    expect(mergedOptionsProvider).toHaveProperty('provide', CLUSTER_MERGED_OPTIONS);
    expect(mergedOptionsProvider).toHaveProperty('useFactory');
    expect(mergedOptionsProvider).toHaveProperty('inject', [CLUSTER_OPTIONS]);
  });

  test('should work correctly', async () => {
    const options: ClusterModuleOptions = { closeClient: false, config: { nodes: [] } };
    const mergedOptions = await mergedOptionsProvider.useFactory(options);

    expect(mergedOptions).toEqual({ ...defaultClusterModuleOptions, ...options });
  });
});
