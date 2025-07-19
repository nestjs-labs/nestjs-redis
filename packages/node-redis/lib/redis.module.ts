import { DynamicModule, Module } from '@nestjs/common';

import { RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces/index.js';
import { REDIS_CLIENT } from './redis.constants';
import { ConfigurableModuleClass } from './redis.module-definition';
import { createAsyncProviders, createRedisClient } from './redis.providers';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule extends ConfigurableModuleClass {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const moduleDefinition = super.forRoot(options);

    return {
      global: options?.isGlobal,
      ...moduleDefinition,
      exports: [RedisService, REDIS_CLIENT],
      providers: [...(moduleDefinition.providers ?? []), createRedisClient(), RedisService]
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const moduleDefinition = super.forRootAsync(options);

    return {
      global: options?.isGlobal,
      ...moduleDefinition,
      exports: [RedisService, REDIS_CLIENT],
      imports: [...(moduleDefinition.imports ?? []), ...(options.extraImports ?? [])],
      providers: [
        ...(moduleDefinition.providers ?? []),
        ...createAsyncProviders(options),
        createRedisClient(),
        RedisService,
        ...(options.extraProviders ?? [])
      ]
    };
  }
}
