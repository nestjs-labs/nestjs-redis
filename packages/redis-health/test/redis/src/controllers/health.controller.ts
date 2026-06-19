import { RedisService } from '@/index.js';
import { RedisHealthIndicator } from '@health/index.js';
import { Controller, Get } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    const client0 = this.redisService.getOrThrow();
    const client1 = this.redisService.getOrThrow('client1');

    return await this.health.check([
      () => this.redis.checkHealth('default', { client: client0, type: 'redis' }),
      () => this.redis.checkHealth('client1', { client: client1, type: 'redis' })
    ]);
  }
}
