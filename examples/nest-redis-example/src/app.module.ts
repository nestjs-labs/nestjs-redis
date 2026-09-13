import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@nestjs-labs/nestjs-redis';
import { RedisHealthModule } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    RedisHealthModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Standalone (default for this example)
        url: configService.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379',
        isGlobal: true,

        // Cluster:
        // cluster: {
        //   rootNodes: [{ url: 'redis://127.0.0.1:16379' }],
        // },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
