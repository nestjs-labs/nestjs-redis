import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

import { Test } from '@nestjs/testing';
import request from 'supertest';

import { RedisService } from '@nestjs-labs/nestjs-ioredis';

import { AppModule } from '../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const key = `ioredis-example:e2e:${randomUUID()}`;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/hello (GET)', async () => {
    await request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect('Hello from Redis!');
  });

  it('should set, get and delete a key', async () => {
    await request(app.getHttpServer())
      .post('/set-key')
      .send({ key, value: 'Hello from ioredis!' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/get-key')
      .query({ key })
      .expect(200)
      .expect('Hello from ioredis!');

    await request(app.getHttpServer())
      .delete('/delete-key')
      .send({ key })
      .expect(200)
      .expect(`Key "${key}" deleted successfully`);

    await request(app.getHttpServer())
      .get('/get-key')
      .query({ key })
      .expect(200)
      .expect('');
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.details.redis.status).toBe('up');
  });

  afterAll(async () => {
    try {
      await app
        .get(RedisService)
        .getOrThrow()
        .del(key, 'ioredis-example:hello');
    } finally {
      await app.close();
    }
  });
});
