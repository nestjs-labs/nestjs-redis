import type { HealthCheckResult } from '@nestjs/terminus';

import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { RedisService } from '@nestjs-labs/nestjs-ioredis';
import { RedisHealthIndicator } from '@nestjs-labs/nestjs-redis-health';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
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
    return await this.redisService.getOrThrow().get('test');
  }

  @Get('redis-info')
  async getRedisInfo() {
    return await this.appService.getRedisInfo();
  }

  @Post('set-key')
  async setKey(@Body() body: { key: string; value: string }) {
    return await this.appService.setKey(body.key, body.value);
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
          client: this.redisService.getOrThrow(),
          timeout: 500,
          type: 'redis',
        }),
    ]);
  }
}
