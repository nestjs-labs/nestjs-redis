// Redis Module
export { RedisModule } from './redis.module.js';

// Redis Service
export { RedisService } from './redis.service.js';

// Redis Providers
export { InjectRedis } from './redis.providers.js';

// Types and Interfaces
export type { RedisOptionsFactory } from './interfaces/redis-factory.interface';
export type { RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces/redis-module-options.interface';
export type { RedisOptions } from './interfaces/redis-options.interface';
export type { RedisClientType, RedisClusterOptions, RedisClusterType } from 'redis';

// Constants
export { REDIS_CLIENT } from './redis.constants';
