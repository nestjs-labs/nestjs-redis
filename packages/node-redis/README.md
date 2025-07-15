# @nestjs-labs/nestjs-redis

Redis(node-redis) module for Nest framework (node.js).

## Installation

```bash
npm install @nestjs-labs/nestjs-redis redis
```

## Quick Start

### 1. Import the module

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-labs/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRoot({
      url: 'redis://localhost:6379',
    }),
  ],
})
export class AppModule {}
```

### 2. Use the service

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs-labs/nestjs-redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async setValue(key: string, value: string) {
    const client = this.redisService.getClient();
    await client.set(key, value);
  }

  async getValue(key: string) {
    const client = this.redisService.getClient();
    return await client.get(key);
  }

  // Health check
  async checkHealth() {
    return await this.redisService.healthCheck();
  }
}
```

## API Reference

### RedisService

#### `getClient(): RedisClientType`

Get the redis client instance.

#### `isConnected(): boolean`

Check if the client is currently connected.

#### `waitForReady(): Promise<void>`

Wait for the client to be ready and connected.

#### `healthCheck(): Promise<RedisHealthCheckResult>`

Perform a health check on the Redis connection.

#### `getClientType(): 'single' | 'cluster'`

Get the type of Redis client (single instance or cluster).

#### `getCluster(): RedisClusterType | null`

Get the cluster client if in cluster mode, null otherwise.

#### `getClusterOrThrow(): RedisClusterType`

Get the cluster client or throw an error if not in cluster mode.

#### `getClusterInfo(): 'single' | ClusterInfo`

Get cluster information if in cluster mode.

### Configuration Options

The module accepts all options from the `redis` package's `RedisClientOptions` interface, plus:

- `url?: string` - Redis connection URL
- `cluster?: RedisClusterOptions` - Redis cluster configuration
- `isGlobal?: boolean` - Whether the module should be global

## Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-labs/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // ... other options
        url: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Cluster Mode

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-labs/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRoot({
      cluster: {
        rootNodes: [
          { url: 'redis://localhost:7000' },
          { url: 'redis://localhost:7001' },
          { url: 'redis://localhost:7002' },
        ],
      },
    }),
  ],
})
export class AppModule {}
```

## Health Monitoring

The service provides built-in health monitoring capabilities:

```typescript
@Injectable()
export class HealthService {
  constructor(private readonly redisService: RedisService) {}

  async checkRedisHealth() {
    const health = await this.redisService.healthCheck();

    return {
      health,
      timestamp: new Date().toISOString()
    };
  }
}
```
