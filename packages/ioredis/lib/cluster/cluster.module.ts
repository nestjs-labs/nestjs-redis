import { MissingConfigurationsError } from '@/errors/index.js';
import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { DynamicModule, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ClusterClients, ClusterModuleAsyncOptions, ClusterModuleOptions } from './interfaces/index.js';
import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS } from './cluster.constants.js';
import {
  clusterClientsProvider,
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider
} from './cluster.providers.js';
import { ClusterService } from './cluster.service.js';
import { logger } from './cluster-logger.js';

@Module({})
export class ClusterModule implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Registers the module synchronously.
   *
   * @param options - The module options
   * @param isGlobal - Register in the global scope
   * @returns A DynamicModule
   */
  static forRoot(options: ClusterModuleOptions, isGlobal = true): DynamicModule {
    const providers: Provider[] = [
      createOptionsProvider(options),
      clusterClientsProvider,
      mergedOptionsProvider,
      ClusterService
    ];

    return {
      exports: [ClusterService],
      global: isGlobal,
      module: ClusterModule,
      providers
    };
  }

  /**
   * Registers the module asynchronously.
   *
   * @param options - The async module options
   * @param isGlobal - Register in the global scope
   * @returns A DynamicModule
   */
  static forRootAsync(options: ClusterModuleAsyncOptions, isGlobal = true): DynamicModule {
    if (!options.useFactory && !options.useClass && !options.useExisting) {
      throw new MissingConfigurationsError();
    }

    const providers: Provider[] = [
      ...createAsyncProviders(options),
      clusterClientsProvider,
      mergedOptionsProvider,
      ClusterService,
      ...(options.extraProviders ?? [])
    ];

    return {
      exports: [ClusterService],
      global: isGlobal,
      imports: options.imports,
      module: ClusterModule,
      providers
    };
  }

  async onApplicationShutdown(): Promise<void> {
    const { closeClient } = this.moduleRef.get<ClusterModuleOptions>(CLUSTER_MERGED_OPTIONS, { strict: false });

    if (closeClient) {
      const clients = this.moduleRef.get<ClusterClients>(CLUSTER_CLIENTS, { strict: false });

      for (const [namespace, client] of clients) {
        if (client.status === 'end') continue;

        if (client.status === 'ready') {
          try {
            await client.quit();
          } catch (e) {
            if (isError(e)) logger.error(generateErrorMessage(namespace, e.message), e.stack);
          }

          continue;
        }

        client.disconnect();
      }
    }
  }
}
