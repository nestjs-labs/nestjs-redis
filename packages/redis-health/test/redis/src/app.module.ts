import { RedisModule } from '@/index.js';
import { RedisHealthModule } from '@health/index.js';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controllers/health.controller';
import { RedisConfigService } from './redis-config.service';

@Module({
  controllers: [HealthController],
  imports: [
    RedisModule.forRootAsync({
      useClass: RedisConfigService
    }),
    TerminusModule,
    RedisHealthModule
  ]
})
export class AppModule {}
