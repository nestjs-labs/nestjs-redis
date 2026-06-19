import { ClusterService } from '@/index.js';
import { RedisHealthIndicator } from '@health/index.js';
import { Controller, Get } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly clusterService: ClusterService,
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    const client0 = this.clusterService.getOrThrow();
    const client1 = this.clusterService.getOrThrow('client1');

    await client0.ping();
    await client1.ping();

    return await this.health.check([
      () => this.redis.checkHealth('default', { client: client0, type: 'cluster' }),
      () => this.redis.checkHealth('client1', { client: client1, type: 'cluster' })
    ]);
  }
}
