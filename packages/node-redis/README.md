[![NPM][npm-shield]][npm-url]
[![Downloads][downloads-shield]][downloads-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Vulnerabilities][vulnerabilities-shield]][vulnerabilities-url]
[![License][license-shield]][license-url]

# @nestjs-labs/nestjs-redis

Redis(node-redis) module for Nest framework (node.js).

> if you are looking for the ioredis module for nestjs, please use [@nestjs-labs/ioredis](https://www.npmjs.com/package/@nestjs-labs/nestjs-ioredis) instead.

- [Documentation](https://nestjs-labs.github.io/nestjs-redis/)

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

[npm-shield]: https://img.shields.io/npm/v/%40nestjs-labs%2Fnestjs-redis?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/@nestjs-labs/nestjs-redis
[downloads-shield]: https://img.shields.io/npm/dm/%40nestjs-labs%2Fnestjs-redis?style=for-the-badge
[downloads-url]: https://www.npmjs.com/package/@nestjs-labs/nestjs-redis
[stars-shield]: https://img.shields.io/github/stars/nestjs-labs/nestjs-redis?style=for-the-badge
[stars-url]: https://github.com/nestjs-labs/nestjs-redis/stargazers
[issues-shield]: https://img.shields.io/github/issues/nestjs-labs/nestjs-redis?style=for-the-badge
[issues-url]: https://github.com/nestjs-labs/nestjs-redis/issues
[vulnerabilities-shield]: https://snyk.io/test/npm/@nestjs-labs/nestjs-redis/badge.svg
[vulnerabilities-url]: https://snyk.io/test/npm/@nestjs-labs/nestjs-redis
[license-shield]: https://img.shields.io/npm/l/%40nestjs-labs%2Fnestjs-redis?style=for-the-badge
[license-url]: https://github.com/nestjs-labs/nestjs-redis/blob/main/LICENSE
