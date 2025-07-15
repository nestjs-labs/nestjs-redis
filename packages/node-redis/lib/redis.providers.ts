import { Provider } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisOptions } from './interfaces';
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition';

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions): Promise<RedisClientType> => {
    const client = createClient(options) as RedisClientType;
    await client.connect();
    return client;
  },
  inject: [MODULE_OPTIONS_TOKEN]
});
