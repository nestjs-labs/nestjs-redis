import { RedisClientOptions, RedisModules, RedisFunctions, RedisScripts, RedisClusterOptions } from 'redis';

/**
 * Interface defining Redis options.
 *
 * @publicApi
 */
export interface RedisOptions<
  M extends RedisModules = RedisModules,
  F extends RedisFunctions = RedisFunctions,
  S extends RedisScripts = RedisScripts
> extends RedisClientOptions<M, F, S> {
  /**
   * `redis[s]://[[username][:password]@][host][:port][/db-number]`
   * See [`redis`](https://www.iana.org/assignments/uri-schemes/prov/redis) and [`rediss`](https://www.iana.org/assignments/uri-schemes/prov/rediss) IANA registration for more details
   */
  url?: string;

  /**
   * Redis cluster configuration
   */
  cluster?: RedisClusterOptions;
}
