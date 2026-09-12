import type { OnApplicationShutdown } from '@nestjs/common';
import type { RedisClients, RedisModuleOptions } from './interfaces/index.js';

import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { Inject, Injectable } from '@nestjs/common';

import { removeListeners } from './common/index.js';
import { REDIS_CLIENTS, REDIS_MERGED_OPTIONS } from './redis.constants.js';
import { logger } from './redis-logger.js';

@Injectable()
export class RedisCleanupProvider implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_MERGED_OPTIONS) private readonly options: RedisModuleOptions,
    @Inject(REDIS_CLIENTS) private readonly clients: RedisClients
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (!this.options.closeClient) return;

    for (const [namespace, client] of this.clients) {
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
