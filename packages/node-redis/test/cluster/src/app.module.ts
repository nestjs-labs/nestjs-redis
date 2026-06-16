import { RedisModule } from '@/index.js';
import { Module } from '@nestjs/common';

import { RedisController } from './controllers/redis.controller';

@Module({
  controllers: [RedisController],
  imports: [
    RedisModule.forRoot({
      cluster: {
        rootNodes: [
          {
            url: 'redis://127.0.0.1:16379'
          }
        ]
      }
    })
  ]
})
export class AppModule {}
