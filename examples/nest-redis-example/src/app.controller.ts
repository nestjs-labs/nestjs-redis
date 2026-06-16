import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { RedisClientType } from 'redis';

import { InjectRedis } from '@nestjs-labs/nestjs-redis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRedis() private readonly redis: RedisClientType,
    private readonly health: HealthCheckService,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @Get('redis-get')
  async getRedis() {
    return await this.redis.get('test');
  }

  @Get('hello')
  async getHello() {
    return await this.appService.getHello();
  }

  @Get('redis-info')
  async getRedisInfo() {
    return await this.appService.getRedisInfo();
  }

  @Post('set-key')
  async setKey(@Body() body: { key: string; value: string }) {
    const { key, value } = body;

    return await this.appService.setKey(key, value);
  }

  @Get('get-key')
  async getKey(@Query('key') key: string) {
    return await this.appService.getKey(key);
  }

  @Delete('delete-key')
  async deleteKey(@Body('key') key: string) {
    return await this.appService.deleteKey(key);
  }

  @Get('health')
  @HealthCheck()
  async healthChecks(): Promise<HealthCheckResult> {
    return await this.health.check([
      () =>
        this.redisIndicator.checkHealth('redis', {
          // @ts-expect-error node-redis client is used; health package types target ioredis only
          client: this.redis,
          timeout: 500,
          type: 'redis',
        }),
    ]);
  }
}
