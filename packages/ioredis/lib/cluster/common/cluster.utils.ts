import type { Namespace } from '@/interfaces';
import type { ClusterClientOptions, ClusterModuleOptions } from '../interfaces';

import { generateErrorMessage, generateReadyMessage } from '@/messages/index.js';
import { get } from '@/utils/index.js';
import { Cluster } from 'ioredis';

import { DEFAULT_CLUSTER, NAMESPACE_KEY } from '../cluster.constants';
import { logger } from '../cluster-logger.js';

export const createClient = (
  { namespace, nodes, onClientCreated, ...clusterOptions }: ClusterClientOptions,
  { errorLog, readyLog }: Partial<ClusterModuleOptions>
): Cluster => {
  const client = new Cluster(nodes, clusterOptions);

  Reflect.defineProperty(client, NAMESPACE_KEY, {
    configurable: false,
    enumerable: false,
    value: namespace ?? DEFAULT_CLUSTER,
    writable: false
  });

  if (readyLog) {
    client.on('ready', () => {
      logger.log(generateReadyMessage(get<Namespace>(client, NAMESPACE_KEY)));
    });
  }

  if (errorLog) {
    client.on('error', (error: Error) => {
      logger.error(generateErrorMessage(get<Namespace>(client, NAMESPACE_KEY), error.message), error.stack);
    });
  }

  if (onClientCreated) onClientCreated(client);

  return client;
};
