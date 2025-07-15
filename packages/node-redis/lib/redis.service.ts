import { Injectable, Inject } from '@nestjs/common';
import type { RedisModules, RedisFunctions, RedisScripts, RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * The redis connection manager (single instance).
 */
@Injectable()
export class RedisService<
  M extends RedisModules = RedisModules,
  F extends RedisFunctions = RedisFunctions,
  S extends RedisScripts = RedisScripts
> {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType<M, F, S>) {}

  /**
   * Get the redis client instance.
   */
  getClient(): RedisClientType<M, F, S> {
    return this.client;
  }

  /**
   * Quit the redis client instance.
   */
  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
