import { MissingConfigurationsError } from '@/errors/index.js';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces/index.js';
import {
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider,
  redisClientsProvider
} from './redis.providers';
import { RedisService } from './redis.service';
import { RedisCleanupProvider } from './redis-cleanup.provider';

@Module({})
export class RedisModule {
  /**
   * Registers the module synchronously.
   *
   * @param options - The module options
   * @param isGlobal - Whether to register in the global scope
   * @returns A DynamicModule
   */
  static forRoot(options: RedisModuleOptions = {}, isGlobal = true): DynamicModule {
    const providers: Provider[] = [
      createOptionsProvider(options),
      redisClientsProvider,
      mergedOptionsProvider,
      RedisService,
      RedisCleanupProvider
    ];

    return {
      exports: [RedisService],
      global: isGlobal,
      module: RedisModule,
      providers
    };
  }

  /**
   * Registers the module asynchronously.
   *
   * @param options - The async module options
   * @param isGlobal - Whether to register in the global scope
   * @returns A DynamicModule
   */
  static forRootAsync(options: RedisModuleAsyncOptions, isGlobal = true): DynamicModule {
    if (!options.useFactory && !options.useClass && !options.useExisting) {
      throw new MissingConfigurationsError();
    }

    const providers: Provider[] = [
      ...createAsyncProviders(options),
      redisClientsProvider,
      mergedOptionsProvider,
      RedisService,
      RedisCleanupProvider,
      ...(options.extraProviders ?? [])
    ];

    return {
      exports: [RedisService],
      global: isGlobal,
      imports: options.imports,
      module: RedisModule,
      providers
    };
  }
}
