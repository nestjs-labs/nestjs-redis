import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@nestjs-labs/nestjs-ioredis';
import { RedisHealthModule } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    RedisHealthModule,
    RedisModule.forRoot({
      config: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        url: process.env.REDIS_URL!,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
