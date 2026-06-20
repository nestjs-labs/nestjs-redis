import type { TestingModule } from '@nestjs/testing';

import { Test } from '@nestjs/testing';

import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

interface RedisClientMock {
  close: jest.Mock<Promise<void>, []>;
  connect: jest.Mock<Promise<void>, []>;
  isOpen: boolean;
  ping: jest.Mock<Promise<string>, []>;
}

interface RedisClusterMock extends RedisClientMock {
  masters: { toString(): string }[];
}

const createClientMock = (overrides: Partial<RedisClientMock> = {}): RedisClientMock => ({
  close: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined),
  isOpen: true,
  ping: jest.fn().mockResolvedValue('PONG'),
  ...overrides
});

const createClusterMock = (overrides: Partial<RedisClusterMock> = {}): RedisClusterMock => ({
  close: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined),
  isOpen: true,
  masters: [{ toString: () => 'redis://127.0.0.1:16379' }],
  ping: jest.fn().mockResolvedValue('PONG'),
  ...overrides
});

describe('RedisService', () => {
  let module: TestingModule;
  let redisService: RedisService;
  let client: RedisClientMock;

  const createTestingModule = async (redisClient: RedisClientMock | RedisClusterMock): Promise<void> => {
    module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: redisClient
        }
      ]
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  };

  beforeEach(async () => {
    client = createClientMock();
    await createTestingModule(client);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('should return the injected redis client', () => {
    expect(redisService.getClient()).toBe(client);
  });

  it('should report whether the client is connected', () => {
    expect(redisService.isConnected()).toBe(true);
  });

  it('should connect when waiting for a closed client to be ready', async () => {
    client.isOpen = false;

    await redisService.waitForReady();

    expect(client.connect).toHaveBeenCalledTimes(1);
  });

  it('should not reconnect an already open client', async () => {
    await redisService.waitForReady();

    expect(client.connect).not.toHaveBeenCalled();
  });

  it('should return an up health check when ping succeeds', async () => {
    await expect(redisService.healthCheck()).resolves.toEqual({ status: 'up' });
    expect(client.ping).toHaveBeenCalledTimes(1);
  });

  it('should return a down health check when the client is closed', async () => {
    client.isOpen = false;

    await expect(redisService.healthCheck()).resolves.toEqual({
      message: 'Client is not connected',
      status: 'down'
    });
    expect(client.ping).not.toHaveBeenCalled();
  });

  it('should return a down health check when ping returns an unexpected response', async () => {
    client.ping.mockResolvedValue('NOPE');

    await expect(redisService.healthCheck()).resolves.toEqual({
      message: 'PING returned unexpected result',
      status: 'down'
    });
  });

  it('should return a down health check when ping throws', async () => {
    client.ping.mockRejectedValue(new Error('boom'));

    await expect(redisService.healthCheck()).resolves.toEqual({
      message: 'Health check failed: Error: boom',
      status: 'down'
    });
  });

  it('should expose single client type and no cluster client for non-cluster mode', () => {
    expect(redisService.getClientType()).toBe('single');
    expect(redisService.isClusterMode()).toBe(false);
    expect(redisService.getCluster()).toBeNull();
    expect(redisService.getClusterInfo()).toBe('single');
    expect(() => redisService.getClusterOrThrow()).toThrow('Client is not in cluster mode');
  });

  it('should expose cluster client details in cluster mode', async () => {
    const cluster = createClusterMock();

    await module.close();
    await createTestingModule(cluster);

    expect(redisService.getClientType()).toBe('cluster');
    expect(redisService.isClusterMode()).toBe(true);
    expect(redisService.getCluster()).toBe(cluster);
    expect(redisService.getClusterOrThrow()).toBe(cluster);
    expect(redisService.getClusterInfo()).toEqual({
      masters: 1,
      nodes: ['redis://127.0.0.1:16379'],
      type: 'cluster'
    });
  });
});
