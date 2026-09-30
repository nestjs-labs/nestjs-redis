# NestJS ioredis example

NestJS 12 ESM example for `@nestjs-labs/nestjs-ioredis` and
`@nestjs-labs/nestjs-redis-health`, using the same routes as the node-redis example.

Requires Node.js 24 and a standalone Redis server. Set `REDIS_URL` to configure
the connection, for example `redis://localhost:6379/0`. The URL can also include
authentication and a logical database number.

## Setup and run

Run these commands from the repository root:

```bash
pnpm install
pnpm --filter @nestjs-labs/nestjs-ioredis --filter @nestjs-labs/nestjs-redis-health run build
pnpm -F nest-ioredis-example run start
```

To run both examples, set a different HTTP port for this one:

```bash
PORT=3001 REDIS_URL=redis://localhost:6379/0 pnpm -F nest-ioredis-example run start
```

Alternatively, copy `.env.example` to `.env` inside this example directory and
adjust its values. To run the built application:

```bash
pnpm -F nest-ioredis-example run build
pnpm -F nest-ioredis-example run start:prod
```

## Redis integration

The example configures the connection directly with `RedisModule.forRoot`:

```ts
RedisModule.forRoot({
  config: {
    url: process.env.REDIS_URL,
  },
});
```

`RedisService.getOrThrow()` retrieves the default ioredis connection.
`RedisHealthIndicator` checks that connection through `/health`.

This example uses standalone Redis. Redis Cluster uses the separate
`ClusterModule` and `ClusterService` APIs.

## Routes

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/` | Returns `Hello World!` |
| GET | `/hello` | Writes and reads `ioredis-example:hello` |
| GET | `/redis-get` | Reads the key `test` |
| GET | `/redis-info` | Returns connection information and Redis INFO |
| POST | `/set-key` | Writes `{ "key": "demo", "value": "hello" }` |
| GET | `/get-key?key=demo` | Reads a key |
| DELETE | `/delete-key` | Deletes the key provided as `{ "key": "demo" }` |
| GET | `/health` | Returns the Redis health status |

## Verification

```bash
pnpm -F nest-ioredis-example run lint
pnpm -F nest-ioredis-example exec tsc -p tsconfig.json --noEmit
pnpm -F nest-ioredis-example run test
REDIS_URL=redis://localhost:6379/12 pnpm -F nest-ioredis-example run test:e2e
```

E2E tests require a running Redis instance and exercise the HTTP routes with real
Redis operations. Use a dedicated test database; the hello route uses a fixed key.
