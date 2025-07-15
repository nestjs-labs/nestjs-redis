import { Provider, Type } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisOptions } from './interfaces';
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces';
import { RedisOptionsFactory } from './interfaces/redis-factory.interface';

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions): Promise<RedisClientType> => {
    const client = createClient(options) as RedisClientType;
    await client.connect();
    return client;
  },
  inject: [MODULE_OPTIONS_TOKEN]
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
      provide: MODULE_OPTIONS_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject || []
    };
  }

  const inject: Type<RedisOptionsFactory<RedisModuleOptions>>[] = [];
  if (options.useClass) {
    inject.push(options.useClass);
  } else if (options.useExisting) {
    inject.push(options.useExisting);
  }

  return {
    provide: MODULE_OPTIONS_TOKEN,
    useFactory: async (optionsFactory: RedisOptionsFactory<RedisModuleOptions>) =>
      optionsFactory.createRedisOptions(),
    inject,
  };
};
