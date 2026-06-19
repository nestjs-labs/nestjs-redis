import { ClusterModule, ClusterModuleOptions } from '@/index.js';
import { RedisHealthModule } from '@health/index.js';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controllers/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ClusterModule.forRootAsync({
      useFactory(): ClusterModuleOptions {
        return {
          config: [
            {
              nodes: [{ host: '127.0.0.1', port: 16379 }]
            },
            {
              namespace: 'client1',
              nodes: [{ host: '127.0.0.1', port: 16379 }]
            }
          ]
        };
      }
    }),
    TerminusModule,
    RedisHealthModule
  ]
})
export class AppModule {}
