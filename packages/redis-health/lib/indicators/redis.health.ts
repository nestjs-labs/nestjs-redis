import { ABNORMALLY_MEMORY_USAGE, CANNOT_BE_READ, FAILED_CLUSTER_STATE, INVALID_TYPE } from '@health/messages';
import { isNullish, parseUsedMemory, promiseTimeout, removeLineBreaks } from '@health/utils';
import { Injectable, Scope } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { RedisCheckSettings } from './redis-check-settings.interface';

/**
 * The RedisHealthIndicator is used for health checks related to redis.
 *
 * @public
 */
@Injectable({ scope: Scope.TRANSIENT })
export class RedisHealthIndicator extends HealthIndicator {
  /**
   * Checks a redis/cluster connection.
   *
   * @param key - The key which will be used for the result object
   * @param options - The extra options for check
   */
  async checkHealth(key: string, options: RedisCheckSettings): Promise<HealthIndicatorResult> {
    const { client, type } = options;
    let isHealthy = false;

    if (type !== 'redis' && type !== 'cluster') throw new Error(INVALID_TYPE);

    try {
      if (type === 'redis') {
        await promiseTimeout(options.timeout ?? 1000, client.ping());

        if (!isNullish(options.memoryThreshold)) {
          const info = await client.info('memory');

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

      isHealthy = true;
    } catch (e) {
      const { message } = e as Error;

      throw new HealthCheckError(message, this.getStatus(key, isHealthy, { message }));
    }

    return this.getStatus(key, isHealthy);
  }
}
