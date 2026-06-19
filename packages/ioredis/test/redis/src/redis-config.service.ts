import { RedisModuleOptions, RedisOptionsFactory } from '@/index.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  createRedisOptions(): RedisModuleOptions {
    return {
      commonOptions: {
        host: '127.0.0.1'
      },
      config: [{ port: 6379 }, { namespace: 'client1', port: 6379 }]
    };
  }
}
