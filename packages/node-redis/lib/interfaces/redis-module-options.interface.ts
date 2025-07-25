import type { DynamicModule, Provider } from '@nestjs/common';
import type { ASYNC_OPTIONS_TYPE, OPTIONS_TYPE } from '../redis.module-definition';

export interface RedisExtraProviders {
  /**
   * Extra providers to be registered within a scope of this module.
   */
  extraProviders?: Provider[];
  /**
   *
   */
  extraImports?: DynamicModule[];
}

export type RedisModuleOptions = typeof OPTIONS_TYPE & RedisExtraProviders;

export type RedisModuleAsyncOptions = typeof ASYNC_OPTIONS_TYPE & RedisExtraProviders;
