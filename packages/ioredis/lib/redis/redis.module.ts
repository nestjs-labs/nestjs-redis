import { MissingConfigurationsError } from '@/errors/index.js';
import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { DynamicModule, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { removeListeners } from './common/index.js';
import { RedisClients, RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces/index.js';
import { REDIS_CLIENTS, REDIS_MERGED_OPTIONS } from './redis.constants';
import {
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider,
  redisClientsProvider
} from './redis.providers';
import { RedisService } from './redis.service';
import { logger } from './redis-logger.js';

@Module({})
export class RedisModule implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

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
      RedisService
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

  async onApplicationShutdown() {
    const { closeClient } = this.moduleRef.get<RedisModuleOptions>(REDIS_MERGED_OPTIONS, { strict: false });

    if (!closeClient) return;
    const clients = this.moduleRef.get<RedisClients>(REDIS_CLIENTS, { strict: false });

    for (const [namespace, client] of clients) {
      try {
        if (client.status === 'end') continue;
        await client.quit();
      } catch (e) {
        if (isError(e)) logger.error(generateErrorMessage(namespace, e.message), e.stack);
      } finally {
        removeListeners(client);
      }
    }
  }
}
