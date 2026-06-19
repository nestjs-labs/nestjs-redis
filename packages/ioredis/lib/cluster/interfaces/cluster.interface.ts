import type { Namespace } from '@/interfaces';
import type { Cluster } from 'ioredis';

export type ClusterClients = Map<Namespace, Cluster>;
