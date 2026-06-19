import type { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import type {
  ClusterClients,
  ClusterModuleAsyncOptions,
  ClusterModuleOptions,
  ClusterOptionsFactory
} from './interfaces';

import { createClient } from './common/index.js';
import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS, CLUSTER_OPTIONS, DEFAULT_CLUSTER } from './cluster.constants';
import { defaultClusterModuleOptions } from './default-options.js';

export const createOptionsProvider = (options: ClusterModuleOptions): ValueProvider<ClusterModuleOptions> => ({
  provide: CLUSTER_OPTIONS,
  useValue: options
});

export const createAsyncProviders = (options: ClusterModuleAsyncOptions): Provider[] => {
  if (options.useClass) {
    return [
      {
        provide: options.useClass,
        useClass: options.useClass
      },
      createAsyncOptionsProvider(options)
    ];
  }

  if (options.useExisting || options.useFactory) return [createAsyncOptionsProvider(options)];

  return [];
};

export const createAsyncOptions = async (optionsFactory: ClusterOptionsFactory): Promise<ClusterModuleOptions> => {
  return await optionsFactory.createClusterOptions();
};

export const createAsyncOptionsProvider = (options: ClusterModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      inject: options.inject,
      provide: CLUSTER_OPTIONS,
      useFactory: options.useFactory
    };
  }

  if (options.useClass) {
    return {
      inject: [options.useClass],
      provide: CLUSTER_OPTIONS,
      useFactory: createAsyncOptions
    };
  }

  if (options.useExisting) {
    return {
      inject: [options.useExisting],
      provide: CLUSTER_OPTIONS,
      useFactory: createAsyncOptions
    };
  }

  return {
    provide: CLUSTER_OPTIONS,
    useValue: {}
  };
};

export const clusterClientsProvider: FactoryProvider<ClusterClients> = {
  inject: [CLUSTER_MERGED_OPTIONS],
  provide: CLUSTER_CLIENTS,
  useFactory: (options: ClusterModuleOptions) => {
    const clients: ClusterClients = new Map();

    if (Array.isArray(options.config)) {
      options.config.forEach(item =>
        clients.set(
          item.namespace ?? DEFAULT_CLUSTER,
          createClient(item, { errorLog: options.errorLog, readyLog: options.readyLog })
        )
      );
    } else if (options.config) {
      clients.set(
        options.config.namespace ?? DEFAULT_CLUSTER,
        createClient(options.config, { errorLog: options.errorLog, readyLog: options.readyLog })
      );
    }

    return clients;
  }
};

export const mergedOptionsProvider: FactoryProvider<ClusterModuleOptions> = {
  inject: [CLUSTER_OPTIONS],
  provide: CLUSTER_MERGED_OPTIONS,
  useFactory: (options: ClusterModuleOptions) => ({ ...defaultClusterModuleOptions, ...options })
};
