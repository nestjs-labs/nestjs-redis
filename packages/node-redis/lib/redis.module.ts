import { Module, DynamicModule } from '@nestjs/common';

import { RedisModuleOptions, RedisModuleAsyncOptions } from './interfaces';
import { ConfigurableModuleClass } from './redis.module-definition';
import { createRedisClient, createAsyncProviders } from './redis.providers';
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
      providers: [
        ...(moduleDefinition.providers ?? []),
        ...createAsyncProviders(options),
        createRedisClient(),
        RedisService,
        ...(options.extraProviders ?? [])
      ],
      imports: [...(moduleDefinition.imports ?? []), ...(options.extraImports ?? [])],
      exports: [RedisService]
    };
  }
}
