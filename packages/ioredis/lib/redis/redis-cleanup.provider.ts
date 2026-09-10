import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { removeListeners } from './common/index.js';
import { RedisClients, RedisModuleOptions } from './interfaces/index.js';
import { REDIS_CLIENTS, REDIS_MERGED_OPTIONS } from './redis.constants';
import { logger } from './redis-logger.js';

@Injectable()
export class RedisCleanupProvider implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const { closeClient } = this.moduleRef.get<RedisModuleOptions>(REDIS_MERGED_OPTIONS, { strict: false });

    if (!closeClient) return;

    const clients = this.moduleRef.get<RedisClients>(REDIS_CLIENTS, { strict: false });

    for (const [namespace, client] of clients) {
      try {
        if (client.status === 'end') continue;

        await client.quit();
      } catch (e) {
        if (isError(e)) logger.error(generateErrorMessage(namespace, e.message), e.stack);
      } finally {
        removeListeners(client);
      }
    }
  }
}
