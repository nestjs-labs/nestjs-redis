import { MissingConfigurationsError } from '@/errors/index.js';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { ClusterModuleAsyncOptions, ClusterModuleOptions } from './interfaces/index.js';
import {
  clusterClientsProvider,
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider
} from './cluster.providers.js';
import { ClusterService } from './cluster.service.js';

@Module({})
export class ClusterModule {
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
}
