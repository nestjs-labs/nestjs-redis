import { Injectable } from '@nestjs/common';

import { RedisService } from '@nestjs-labs/nestjs-ioredis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getRedisHello(): Promise<string | null> {
    const redis = this.redisService.getOrThrow();

    await redis.set('ioredis-example:hello', 'Hello from Redis!');

    return await redis.get('ioredis-example:hello');
  }

  async getRedisInfo() {
    const redis = this.redisService.getOrThrow();
    const info = await redis.info();

    return {
      isCluster: false,
      message: 'Redis connection successful',
      serverInfo: info,
    };
  }

  async setKey(key: string, value: string): Promise<string> {
    const redis = this.redisService.getOrThrow();

    await redis.set(key, value);

    return `Key "${key}" set successfully`;
  }

  async getKey(key: string): Promise<string | null> {
    return await this.redisService.getOrThrow().get(key);
  }

  async deleteKey(key: string): Promise<string> {
    const result = await this.redisService.getOrThrow().del(key);

    return result > 0
      ? `Key "${key}" deleted successfully`
      : `Key "${key}" not found`;
  }
}
