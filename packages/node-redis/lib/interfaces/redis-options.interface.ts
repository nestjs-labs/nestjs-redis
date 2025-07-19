import type { RedisClientOptions, RedisClusterOptions, RedisFunctions, RedisModules, RedisScripts } from 'redis';

/**
 * Interface defining Redis options.
 *
 */
export interface RedisOptions<
  M extends RedisModules = RedisModules,
  F extends RedisFunctions = RedisFunctions,
  S extends RedisScripts = RedisScripts
> extends RedisClientOptions<M, F, S> {
  /**
   * Redis connection URL.
   * Format: `redis[s]://[[username][:password]@][host][:port][/db-number]`
   *
   * Examples:
   * - `redis://localhost:6379`
   * - `redis://user:password@localhost:6379`
   * - `rediss://localhost:6380` (SSL)
   *
   * See [`redis`](https://www.iana.org/assignments/uri-schemes/prov/redis) and [`rediss`](https://www.iana.org/assignments/uri-schemes/prov/rediss) IANA registration for more details
   */
  url?: string;

  /**
   * Redis cluster configuration.
   * Use this when connecting to a Redis Cluster instead of a single Redis instance.
   */
  cluster?: RedisClusterOptions;
}
