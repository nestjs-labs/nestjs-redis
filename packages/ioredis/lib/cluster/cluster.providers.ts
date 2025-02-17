import { Provider, FactoryProvider, ValueProvider } from '@nestjs/common';
import { ClusterModuleOptions, ClusterModuleAsyncOptions, ClusterOptionsFactory, ClusterClients } from './interfaces';
import { CLUSTER_OPTIONS, CLUSTER_CLIENTS, DEFAULT_CLUSTER, CLUSTER_MERGED_OPTIONS } from './cluster.constants';
import { createClient } from './common';
import { defaultClusterModuleOptions } from './default-options';

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
      provide: CLUSTER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject
    };
  }

  if (options.useClass) {
    return {
      provide: CLUSTER_OPTIONS,
      useFactory: createAsyncOptions,
      inject: [options.useClass]
    };
  }

  if (options.useExisting) {
    return {
      provide: CLUSTER_OPTIONS,
      useFactory: createAsyncOptions,
      inject: [options.useExisting]
    };
  }

  return {
    provide: CLUSTER_OPTIONS,
    useValue: {}
  };
};

export const clusterClientsProvider: FactoryProvider<ClusterClients> = {
  provide: CLUSTER_CLIENTS,
  useFactory: (options: ClusterModuleOptions) => {
    const clients: ClusterClients = new Map();
    if (Array.isArray(options.config)) {
      options.config.forEach(item =>
        clients.set(
          item.namespace ?? DEFAULT_CLUSTER,
          createClient(item, { readyLog: options.readyLog, errorLog: options.errorLog })
        )
      );
    } else if (options.config) {
      clients.set(
        options.config.namespace ?? DEFAULT_CLUSTER,
        createClient(options.config, { readyLog: options.readyLog, errorLog: options.errorLog })
      );
    }
    return clients;
  },
  inject: [CLUSTER_MERGED_OPTIONS]
};

export const mergedOptionsProvider: FactoryProvider<ClusterModuleOptions> = {
  provide: CLUSTER_MERGED_OPTIONS,
  useFactory: (options: ClusterModuleOptions) => ({ ...defaultClusterModuleOptions, ...options }),
  inject: [CLUSTER_OPTIONS]
};
