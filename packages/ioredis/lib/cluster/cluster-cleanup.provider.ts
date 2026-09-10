import { generateErrorMessage } from '@/messages/index.js';
import { isError } from '@/utils/index.js';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ClusterClients, ClusterModuleOptions } from './interfaces/index.js';
import { CLUSTER_CLIENTS, CLUSTER_MERGED_OPTIONS } from './cluster.constants.js';
import { logger } from './cluster-logger.js';

@Injectable()
export class ClusterCleanupProvider implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const { closeClient } = this.moduleRef.get<ClusterModuleOptions>(CLUSTER_MERGED_OPTIONS, { strict: false });

    if (closeClient) {
      const clients = this.moduleRef.get<ClusterClients>(CLUSTER_CLIENTS, { strict: false });

      for (const [namespace, client] of clients) {
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
}
