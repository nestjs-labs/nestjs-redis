import type { Namespace } from '@/interfaces';
import type { Redis } from 'ioredis';

export type RedisClients = Map<Namespace, Redis>;
