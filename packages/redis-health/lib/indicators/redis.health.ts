import type { HealthIndicatorResult } from '@nestjs/terminus';
import type { RedisCheckSettings } from './redis-check-settings.interface';

import { ABNORMALLY_MEMORY_USAGE, CANNOT_BE_READ, FAILED_CLUSTER_STATE, INVALID_TYPE } from '@health/messages';
import { isNullish, parseUsedMemory, promiseTimeout, removeLineBreaks } from '@health/utils';
import { Injectable, Scope } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

export interface RedisHealthClient {
  info: (section: string) => Promise<string>;
  ping: () => Promise<unknown>;
}

/**
 * The RedisHealthIndicator is used for health checks related to redis.
 *
 * @public
 */
@Injectable({ scope: Scope.TRANSIENT })
export class RedisHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  /**
   * Checks a redis/cluster connection.
   *
   * @param key - The key which will be used for the result object
   * @param options - The extra options for check
   */
  async checkHealth(key: string, options: RedisCheckSettings): Promise<HealthIndicatorResult> {
    const { client, type } = options;

    if (type !== 'redis' && type !== 'cluster') throw new Error(INVALID_TYPE);

    const check = this.healthIndicatorService.check(key);

    try {
      if (type === 'redis') {
        const redisClient = client as RedisHealthClient;

        await promiseTimeout(options.timeout ?? 1000, redisClient.ping());

        if (!isNullish(options.memoryThreshold)) {
          const info = await redisClient.info('memory');

          if (parseUsedMemory(removeLineBreaks(info)) > options.memoryThreshold) {
            throw new Error(ABNORMALLY_MEMORY_USAGE);
          }
        }
      } else {
        const clusterInfo = await client.cluster('INFO');

        if (typeof clusterInfo === 'string') {
          if (!clusterInfo.includes('cluster_state:ok')) throw new Error(FAILED_CLUSTER_STATE);
        } else throw new Error(CANNOT_BE_READ);
      }
    } catch (e) {
      const { message } = e as Error;

      return check.down(message);
    }

    return check.up();
  }
}
