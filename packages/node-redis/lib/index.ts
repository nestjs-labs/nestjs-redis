// Redis Module
export { RedisModule } from './redis.module';

// Redis Service
export { RedisService } from './redis.service';

// Types and Interfaces
export type { RedisClientType, RedisClusterType, RedisClusterOptions } from 'redis';
export type { RedisOptions } from './interfaces/redis-options.interface';
export type { RedisModuleOptions, RedisModuleAsyncOptions } from './interfaces/redis-module-options.interface';
export type { RedisOptionsFactory } from './interfaces/redis-factory.interface';

// Constants
export { REDIS_CLIENT } from './redis.constants';
