import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs-labs/nestjs-redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(): Promise<string | null> {
    const redis = this.redisService.getClient();
    await redis.set('test-key', 'Hello from Redis!');
    return await redis.get('test-key');
  }

  async getRedisInfo() {
    const redis = this.redisService.getClient();
    const info = await redis.info();
    return {
      message: 'Redis connection successful',
      serverInfo: info,
    };
  }

  async setKey(key: string, value: string): Promise<string> {
    const client = this.redisService.getClient();
    await client.set(key, value);
    return `Key "${key}" set successfully`;
  }

  async getKey(key: string): Promise<string | null> {
    const client = this.redisService.getClient();
    return await client.get(key);
  }

  async deleteKey(key: string): Promise<string> {
    const client = this.redisService.getClient();
    const result = await client.del(key);
    return result > 0
      ? `Key "${key}" deleted successfully`
      : `Key "${key}" not found`;
  }
}
