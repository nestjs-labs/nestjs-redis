import { Injectable, Inject } from '@nestjs/common';
import type { RedisModules, RedisFunctions, RedisScripts, RedisClientType, RedisClusterType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * The redis connection manager (single instance or cluster).
 */
@Injectable()
export class RedisService<
  M extends RedisModules = RedisModules,
  F extends RedisFunctions = RedisFunctions,
  S extends RedisScripts = RedisScripts
> {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType<M, F, S> | RedisClusterType<M, F, S>) {}

  /**
   * Get the redis client instance.
   */
  getClient(): RedisClientType<M, F, S> | RedisClusterType<M, F, S> {
    return this.client;
  }

  /**
   * Get the redis cluster client instance.
   */
  getCluster(): RedisClusterType<M, F, S> {
    return this.client as unknown as RedisClusterType<M, F, S>;
  }

  /**
   * Check if the client is in cluster mode.
   */
  isClusterMode(): boolean {
    // check if the client is a cluster client
    if ('masters' in this.client) {
      return true;
    }
    return false;
  }

  /**
   * Get client type information.
   */
  getClientType(): 'single' | 'cluster' {
    return this.isClusterMode() ? 'cluster' : 'single';
  }

  /**
   * Get cluster information if in cluster mode.
   */
  getClusterInfo() {
    if (!this.isClusterMode()) {
      return 'single';
    }
    const cluster = this.getCluster();
    try {
      const masters = cluster.masters;
      return {
        type: 'cluster',
        masters: masters.length,
        nodes: masters.map((node) => node.toString())
      };
    } catch (error) {
      throw new Error(`Failed to get cluster info: ${String(error)}`);
    }
  }

  /**
   * Quit the redis client instance.
   */
  async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
