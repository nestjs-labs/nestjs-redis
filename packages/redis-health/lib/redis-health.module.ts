import { Module } from '@nestjs/common';

import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * @public
 */
@Module({
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator]
})
export class RedisHealthModule {}
