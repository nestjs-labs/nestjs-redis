import type { Provider, Type } from '@nestjs/common';
import type { RedisClientType, RedisClusterType } from 'redis';
import type { RedisModuleAsyncOptions, RedisModuleOptions, RedisOptions } from './interfaces';
import type { RedisOptionsFactory } from './interfaces/redis-factory.interface';

import { Inject } from '@nestjs/common';
import { createClient, createCluster } from 'redis';

import { REDIS_CLIENT } from './redis.constants';
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition';

/**
 * Inject the Redis client.
 * @returns The Redis client.
 */
export const InjectRedis = () => Inject(REDIS_CLIENT);

/**
 * Create a Redis client.
 * @returns The Redis client.
 */
export const createRedisClient = (): Provider => ({
  inject: [MODULE_OPTIONS_TOKEN],
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions): Promise<RedisClientType | RedisClusterType> => {
    if (options.cluster) {
      const cluster = createCluster(options.cluster);

      await cluster.connect();

      return cluster as RedisClusterType;
    }

    const client = createClient(options) as RedisClientType;

    await client.connect();

    return client;
  }
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

export const createAsyncOptionsProvider = (options: RedisModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      inject: options.inject ?? [],
      provide: MODULE_OPTIONS_TOKEN,
      useFactory: options.useFactory
    };
  }

  const inject: Type<RedisOptionsFactory<RedisModuleOptions>>[] = [];

  if (options.useClass) {
    inject.push(options.useClass);
  } else if (options.useExisting) {
    inject.push(options.useExisting);
  }

  return {
    inject,
    provide: MODULE_OPTIONS_TOKEN,
    useFactory: async (optionsFactory: RedisOptionsFactory<RedisModuleOptions>) => {
      return await optionsFactory.createRedisOptions();
    }
  };
};
