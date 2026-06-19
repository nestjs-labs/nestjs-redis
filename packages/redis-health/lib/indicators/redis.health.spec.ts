import type { TestingModule } from '@nestjs/testing';

import { ABNORMALLY_MEMORY_USAGE, CANNOT_BE_READ, FAILED_CLUSTER_STATE, OPERATIONS_TIMEOUT } from '@health/messages';
import { Test } from '@nestjs/testing';
import Redis, { Cluster } from 'ioredis';

import { RedisHealthIndicator } from './redis.health';

const mockPing = jest.fn();
const mockInfo = jest.fn();
const mockClusterInfo = jest.fn();

jest.mock('ioredis', () => ({
  Cluster: jest.fn(() => ({
    cluster: mockClusterInfo
  })),
  __esModule: true,
  default: jest.fn(() => ({
    info: mockInfo,
    ping: mockPing
  }))
}));

describe('RedisHealthIndicator', () => {
  let redis: Redis;
  let cluster: Cluster;
  let indicator: RedisHealthIndicator;

  beforeEach(async () => {
    mockPing.mockReset();
    mockInfo.mockReset();
    mockClusterInfo.mockReset();
    redis = new Redis();
    cluster = new Cluster([]);

    const module: TestingModule = await Test.createTestingModule({ providers: [RedisHealthIndicator] }).compile();

    indicator = await module.resolve<RedisHealthIndicator>(RedisHealthIndicator);
  });

  describe('redis', () => {
    test('the status should be up', async () => {
      jest.spyOn(redis, 'ping').mockResolvedValue('PONG');
      jest.spyOn(redis, 'info').mockResolvedValue('# Memory used_memory:100000 used_memory_human:');

      await expect(
        indicator.checkHealth('redis', {
          client: redis,
          memoryThreshold: 1024 * 1024 * 100,
          timeout: 1000,
          type: 'redis'
        })
      ).resolves.toEqual({
        redis: { status: 'up' }
      });
    });

    test('should throw an error if type is invalid', async () => {
      await expect(
        indicator.checkHealth('', { client: redis, type: 'unknown' as unknown as 'redis' })
      ).rejects.toThrow();
    });

    test('should throw an error if ping is rejected', async () => {
      const message = 'a redis error';

      jest.spyOn(redis, 'ping').mockRejectedValue(new Error(message));

      await expect(indicator.checkHealth('', { client: redis, type: 'redis' })).rejects.toThrow(message);
    });

    test('should throw an error if ping timed out', async () => {
      jest.useFakeTimers();

      const waitPromise = (ms: number) =>
        new Promise<string>(resolve => {
          setTimeout(() => resolve('PONG'), ms);
        });

      jest.spyOn(redis, 'ping').mockImplementation(() => waitPromise(2000));
      const promise = indicator.checkHealth('', { client: redis, type: 'redis' });

      jest.runAllTimers();
      await expect(promise).rejects.toThrow(OPERATIONS_TIMEOUT(1000));
    });

    test('should throw an error if used memory is greater than threshold', async () => {
      jest.spyOn(redis, 'ping').mockResolvedValue('PONG');
      jest.spyOn(redis, 'info').mockResolvedValue('# Memory used_memory:101000 used_memory_human:');

      await expect(
        indicator.checkHealth('redis', { client: redis, memoryThreshold: 1000 * 100, type: 'redis' })
      ).rejects.toThrow(ABNORMALLY_MEMORY_USAGE);
    });
  });

  describe('cluster', () => {
    test('the status should be up', async () => {
      mockClusterInfo.mockResolvedValue('cluster_state:ok');

      await expect(indicator.checkHealth('cluster', { client: cluster, type: 'cluster' })).resolves.toEqual({
        cluster: { status: 'up' }
      });
    });

    test('should throw an error', async () => {
      const message = 'a redis error';

      mockClusterInfo.mockRejectedValue(new Error(message));

      await expect(indicator.checkHealth('', { client: cluster, type: 'cluster' })).rejects.toThrow(message);
    });

    test('should throw an error if cluster info is null', async () => {
      mockClusterInfo.mockResolvedValue(null);

      await expect(indicator.checkHealth('', { client: cluster, type: 'cluster' })).rejects.toThrow(CANNOT_BE_READ);
    });

    test('should throw an error if cluster info does not contain "cluster_state:ok"', async () => {
      mockClusterInfo.mockResolvedValue('cluster_state:fail');

      await expect(indicator.checkHealth('', { client: cluster, type: 'cluster' })).rejects.toThrow(
        FAILED_CLUSTER_STATE
      );
    });
  });
});
