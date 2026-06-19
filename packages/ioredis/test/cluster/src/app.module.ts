import { ClusterModule, ClusterModuleOptions } from '@/index.js';
import { Module } from '@nestjs/common';

import { InjectController } from './controllers/inject.controller';
import { ManagerController } from './controllers/manager.controller';

@Module({
  controllers: [InjectController, ManagerController],
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
    })
  ]
})
export class AppModule {}
