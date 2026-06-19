import type { RedisModuleOptions } from './interfaces';

export const defaultRedisModuleOptions: RedisModuleOptions = {
  closeClient: true,
  commonOptions: undefined,
  config: {},
  errorLog: true,
  readyLog: true
};
