import { RedisModule } from '@/index.js';
import { Module } from '@nestjs/common';

import { InjectController } from './controllers/inject.controller';
import { ManagerController } from './controllers/manager.controller';
import { RedisConfigService } from './redis-config.service';

@Module({
  controllers: [InjectController, ManagerController],
  imports: [
    RedisModule.forRootAsync({
      useClass: RedisConfigService
    })
  ]
})
export class AppModule {}
