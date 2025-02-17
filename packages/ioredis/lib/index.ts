export { ConnectionNotFoundError, MissingConfigurationsError } from './errors';
export { RedisModule } from './redis/redis.module';
export { DEFAULT_REDIS } from './redis/redis.constants';
export { RedisService } from './redis/redis.service';
export { ClusterModule } from './cluster/cluster.module';
export { DEFAULT_CLUSTER } from './cluster/cluster.constants';
export { ClusterService } from './cluster/cluster.service';

// * Types & Interfaces
export type { Namespace } from './interfaces';
export type {
  RedisModuleOptions,
  RedisModuleAsyncOptions,
  RedisOptionsFactory,
  RedisClientOptions
} from './redis/interfaces';
export type {
  ClusterModuleOptions,
  ClusterModuleAsyncOptions,
  ClusterOptionsFactory,
  ClusterClientOptions
} from './cluster/interfaces';
