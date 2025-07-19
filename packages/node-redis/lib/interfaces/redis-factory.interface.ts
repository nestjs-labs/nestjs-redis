import type { RedisOptions } from './redis-options.interface';

/**
 * Interface describing a `RedisOptionsFactory`.  Providers supplying configuration
 * options for the Redis module must implement this interface.
 *
 */
export interface RedisOptionsFactory<T extends RedisOptions> {
  createRedisOptions(): Promise<T> | T;
}
