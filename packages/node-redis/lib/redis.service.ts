import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
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
> implements OnModuleDestroy
{
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType<M, F, S> | RedisClusterType<M, F, S>) {}

  /**
   * Get the redis client instance.
   */
  getClient(): RedisClientType<M, F, S> | RedisClusterType<M, F, S> {
    return this.client;
  }

  /**
   * Check if the client is connected.
   */
  isConnected(): boolean {
    return this.client.isOpen;
  }

  /**
   * Wait for the client to be ready.
   */
  async waitForReady(): Promise<void> {
    if (!this.isConnected()) {
      await this.client.connect();
    }
  }

  /**
   * Health check for the Redis connection.
   */
  async healthCheck(): Promise<{ status: 'up' | 'down'; message?: string }> {
    try {
      if (!this.isConnected()) {
        return { status: 'down', message: 'Client is not connected' };
      }

      // ping the client
      const client = this.client as RedisClientType;
      const result = await client.ping();
      if (result === 'PONG') {
        return { status: 'up' };
      } else {
        return { status: 'down', message: 'PING returned unexpected result' };
      }
    } catch (error) {
      return { status: 'down', message: `Health check failed: ${String(error)}` };
    }
  }

  /**
   * Get the redis cluster client instance.
   * Returns null if the client is not in cluster mode.
   */
  getCluster(): RedisClusterType<M, F, S> | null {
    if (!this.isClusterMode()) {
      return null;
    }
    // Safe type assertion after checking cluster mode
    return this.client as RedisClusterType<M, F, S>;
  }

  /***
   * Get the redis cluster client instance.
   * Throws an error if the client is not in cluster mode.
   */
  getClusterOrThrow(): RedisClusterType<M, F, S> {
    if (!this.isClusterMode()) {
      throw new Error('Client is not in cluster mode');
    }
    return this.client as RedisClusterType<M, F, S>;
  }

  /**
   * Check if the client is in cluster mode.
   */
  isClusterMode(): boolean {
    // check if the client is a cluster client
    return 'masters' in this.client;
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
  getClusterInfo(): 'single' | { type: 'cluster'; masters: number; nodes: string[] } {
    if (!this.isClusterMode()) {
      return 'single';
    }

    const cluster = this.getCluster();
    if (!cluster) {
      return 'single';
    }

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
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.isConnected()) {
        await this.client.close();
      }
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}
