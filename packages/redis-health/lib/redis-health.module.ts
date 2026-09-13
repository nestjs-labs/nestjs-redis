import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * @public
 */
@Module({
  exports: [RedisHealthIndicator],
  imports: [TerminusModule],
  providers: [RedisHealthIndicator]
})
export class RedisHealthModule {}
