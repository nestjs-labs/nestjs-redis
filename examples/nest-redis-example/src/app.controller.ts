import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import type { RedisClientType } from 'redis';

import { InjectRedis } from '@nestjs-labs/nestjs-redis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRedis() private readonly redis: RedisClientType,
    private readonly health: HealthCheckService,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  async getRedisHello(): Promise<string | null> {
    return await this.appService.getRedisHello();
  }

  @Get('redis-get')
  async getRedis() {
    return await this.redis.get('test');
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
          client: this.redis,
          timeout: 500,
          type: 'redis',
        }),
    ]);
  }
}
