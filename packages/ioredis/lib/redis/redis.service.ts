import type { Namespace } from '@/interfaces';
import type { Redis } from 'ioredis';
import type { RedisClients } from './interfaces';

import { ConnectionNotFoundError } from '@/errors/index.js';
import { parseNamespace } from '@/utils/index.js';
import { Inject, Injectable } from '@nestjs/common';

import { DEFAULT_REDIS, REDIS_CLIENTS } from './redis.constants';

/**
 * The redis connections manager.
 */
@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENTS) private readonly clients: RedisClients) {}

  /**
   * Retrieves a redis connection by namespace.
   * However, if the retrieving does not find a connection, it returns ClientNotFoundError: No Connection found error.
   *
   * @param namespace - The namespace
   * @returns A redis connection
   */
  getOrThrow(namespace: Namespace = DEFAULT_REDIS): Redis {
    const client = this.clients.get(namespace);

    if (!client) throw new ConnectionNotFoundError(parseNamespace(namespace));

    return client;
  }

  /**
   * Retrieves a redis connection by namespace, if the retrieving does not find a connection, it returns `null`;
   *
   * @param namespace - The namespace
   * @returns A redis connection or `null`
   */
  getOrNil(namespace: Namespace = DEFAULT_REDIS): Redis | null {
    const client = this.clients.get(namespace);

    if (!client) return null;

    return client;
  }
}
