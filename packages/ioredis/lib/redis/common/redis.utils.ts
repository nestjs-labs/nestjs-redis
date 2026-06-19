import type { Namespace } from '@/interfaces';
import type { RedisClientOptions, RedisModuleOptions } from '../interfaces';

import { generateErrorMessage, generateReadyMessage } from '@/messages/index.js';
import { get, isDirectInstanceOf } from '@/utils/index.js';
import { Redis } from 'ioredis';

import { DEFAULT_REDIS, NAMESPACE_KEY } from '../redis.constants';
import { logger } from '../redis-logger.js';

export function readyCallback(this: Redis) {
  logger.log(generateReadyMessage(get<Namespace>(this, NAMESPACE_KEY)));
}

export function errorCallback(this: Redis, error: Error) {
  logger.error(generateErrorMessage(get<Namespace>(this, NAMESPACE_KEY), error.message), error.stack);
}

export function removeListeners(instance: Redis) {
  instance.removeListener('ready', readyCallback);
  instance.removeListener('error', errorCallback);
}

export const create = (
  { created, namespace, onClientCreated, path, provide, url, ...redisOptions }: RedisClientOptions,
  { beforeCreate, errorLog, readyLog }: RedisModuleOptions
): Redis => {
  let client: Redis;

  if (beforeCreate) beforeCreate();
  if (provide) client = provide();
  else if (url) client = new Redis(url, redisOptions);
  else if (path) client = new Redis(path, redisOptions);
  else client = new Redis(redisOptions);
  if (!isDirectInstanceOf(client, Redis)) throw new TypeError('A valid instance of ioredis is required.');
  Reflect.defineProperty(client, NAMESPACE_KEY, { value: namespace ?? DEFAULT_REDIS, writable: false });
  if (readyLog) client.on('ready', readyCallback);
  if (errorLog) client.on('error', errorCallback);
  if (created) created(client);
  if (onClientCreated) onClientCreated(client);

  return client;
};
