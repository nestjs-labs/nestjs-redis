import { Module, DynamicModule } from '@nestjs/common';

import { RedisModuleOptions, RedisModuleAsyncOptions } from './interfaces';
import { ConfigurableModuleClass } from './redis.module-definition';
import { createRedisClient } from './redis.providers';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule extends ConfigurableModuleClass {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const moduleDefinition = super.forRoot(options);
    return {
      global: options?.isGlobal,
      ...moduleDefinition,
      providers: [...(moduleDefinition.providers ?? []), createRedisClient(), RedisService],
      exports: [RedisService]
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const moduleDefinition = super.forRootAsync(options);
    return {
      global: options?.isGlobal,
      ...moduleDefinition,
      providers: [...(moduleDefinition.providers ?? []), createRedisClient(), RedisService],
      exports: [RedisService]
    };
  }
}
