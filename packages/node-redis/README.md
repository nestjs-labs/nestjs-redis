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
}
```

## API Reference

### RedisService

#### `getClient(): RedisClientType`

Get the redis client instance.

### Configuration Options

The module accepts all options from the `redis` package's `RedisClientOptions` interface, plus:

- `url?: string` - Redis connection URL
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
        url: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
