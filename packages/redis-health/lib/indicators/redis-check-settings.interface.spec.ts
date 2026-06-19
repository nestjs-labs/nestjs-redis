import type { RedisClientType } from 'redis';
import type { RedisCheckSettings } from './redis-check-settings.interface';

type Assert<T extends true> = T;

test('accepts node-redis clients for redis checks', () => {
  interface NodeRedisSettings {
    client: RedisClientType;
    timeout: 500;
    type: 'redis';
  }

  const acceptsNodeRedisClient: Assert<NodeRedisSettings extends RedisCheckSettings ? true : false> = true;

  expect(acceptsNodeRedisClient).toBe(true);
});
