import type { OnApplicationShutdown } from '@nestjs/common';
import type { ClusterClients, ClusterModuleOptions } from './interfaces/index.js';

import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { Inject, Injectable } from '@nestjs/common';

import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS } from './cluster.constants.js';
import { logger } from './cluster-logger.js';

@Injectable()
export class ClusterCleanupProvider implements OnApplicationShutdown {
  constructor(
    @Inject(CLUSTER_MERGED_OPTIONS) private readonly options: ClusterModuleOptions,
    @Inject(CLUSTER_CLIENTS) private readonly clients: ClusterClients
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (!this.options.closeClient) return;

    for (const [namespace, client] of this.clients) {
      if (client.status === 'end') continue;

      if (client.status === 'ready') {
        try {
          await client.quit();
        } catch (e) {
          if (isError(e)) logger.error(generateErrorMessage(namespace, e.message), e.stack);
        }

        continue;
      }

      client.disconnect();
    }
  }
}
