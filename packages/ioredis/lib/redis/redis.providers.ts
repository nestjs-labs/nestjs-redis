import type { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import type { RedisClients, RedisModuleAsyncOptions, RedisModuleOptions, RedisOptionsFactory } from './interfaces';

import { create } from './common/index.js';
import { defaultRedisModuleOptions } from './default-options.js';
import { DEFAULT_REDIS, REDIS_CLIENTS, REDIS_MERGED_OPTIONS, REDIS_OPTIONS } from './redis.constants';

export const createOptionsProvider = (options: RedisModuleOptions): ValueProvider<RedisModuleOptions> => ({
  provide: REDIS_OPTIONS,
  useValue: options
});

export const createAsyncProviders = (options: RedisModuleAsyncOptions): Provider[] => {
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

export const createAsyncOptions = async (optionsFactory: RedisOptionsFactory): Promise<RedisModuleOptions> => {
  return await optionsFactory.createRedisOptions();
};

export const createAsyncOptionsProvider = (options: RedisModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      inject: options.inject,
      provide: REDIS_OPTIONS,
      useFactory: options.useFactory
    };
  }

  if (options.useClass) {
    return {
      inject: [options.useClass],
      provide: REDIS_OPTIONS,
      useFactory: createAsyncOptions
    };
  }

  if (options.useExisting) {
    return {
      inject: [options.useExisting],
      provide: REDIS_OPTIONS,
      useFactory: createAsyncOptions
    };
  }

  return {
    provide: REDIS_OPTIONS,
    useValue: {}
  };
};

export const redisClientsProvider: FactoryProvider<RedisClients> = {
  inject: [REDIS_MERGED_OPTIONS],
  provide: REDIS_CLIENTS,
  useFactory: (options: RedisModuleOptions) => {
    const clients: RedisClients = new Map();

    if (Array.isArray(options.config)) {
      for (const item of options.config) {
        clients.set(
          item.namespace ?? DEFAULT_REDIS,
          create(
            { ...options.commonOptions, ...item },
            { beforeCreate: options.beforeCreate, errorLog: options.errorLog, readyLog: options.readyLog }
          )
        );
      }
    } else if (options.config) {
      clients.set(
        options.config.namespace ?? DEFAULT_REDIS,
        create(
          { ...options.commonOptions, ...options.config },
          {
            beforeCreate: options.beforeCreate,
            errorLog: options.errorLog,
            readyLog: options.readyLog
          }
        )
      );
    }

    return clients;
  }
};

export const mergedOptionsProvider: FactoryProvider<RedisModuleOptions> = {
  inject: [REDIS_OPTIONS],
  provide: REDIS_MERGED_OPTIONS,
  useFactory: (options: RedisModuleOptions) => ({ ...defaultRedisModuleOptions, ...options })
};
