import { RedisModuleOptions, RedisOptionsFactory } from '@/index.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  createRedisOptions(): RedisModuleOptions {
    return {
      commonOptions: {
        host: '127.0.0.1'
      },
      config: [
        { password: 'myredis', port: 6380 },
        { namespace: 'client1', password: 'myredis', port: 6380 }
      ]
    };
  }
}
