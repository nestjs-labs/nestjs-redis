import type { ClusterClientOptions } from '../interfaces/index.js';

import { Cluster } from 'ioredis';
import { vi } from 'vitest';

import { NAMESPACE_KEY } from '../cluster.constants.js';
import { createClient } from './cluster.utils.js';

const { mockOn } = vi.hoisted(() => ({
  mockOn: vi.fn()
}));

vi.mock('../cluster-logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn()
  }
}));

vi.mock('ioredis', () => ({
  Cluster: vi.fn(
    class {
      disconnect = vi.fn();
      on = mockOn;
      quit = vi.fn();
    }
  )
}));

const MockedCluster = vi.mocked(Cluster);

beforeEach(() => {
  MockedCluster.mockClear();
  mockOn.mockReset();
});

describe('createClient', () => {
  test('should create a client with options', () => {
    const options: ClusterClientOptions = {
      nodes: [{ host: '127.0.0.1', port: 16380 }],
      redisOptions: { password: '' }
    };
    const client = createClient(options, {});

    expect(client).toBeDefined();
    expect(MockedCluster).toHaveBeenCalledTimes(1);
    expect(MockedCluster).toHaveBeenCalledWith(options.nodes, { redisOptions: { password: '' } });
    expect(MockedCluster.mock.instances).toHaveLength(1);
  });

  test('should call onClientCreated', () => {
    const mockOnClientCreated = vi.fn();
    const client = createClient({ nodes: [], onClientCreated: mockOnClientCreated }, {});

    expect(client).toBeDefined();
    expect(MockedCluster).toHaveBeenCalledTimes(1);
    expect(MockedCluster).toHaveBeenCalledWith([], {});
    expect(MockedCluster.mock.instances).toHaveLength(1);
    expect(mockOnClientCreated).toHaveBeenCalledTimes(1);
    expect(mockOnClientCreated).toHaveBeenCalledWith(client);
  });

  test('should set namespace correctly', () => {
    const namespace = Symbol();
    const client = createClient({ namespace, nodes: [] }, { errorLog: false, readyLog: false });

    expect(Reflect.get(client, NAMESPACE_KEY)).toBe(namespace);
  });

  test('should add ready listener', () => {
    const client = createClient({ nodes: [] }, { readyLog: true });

    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(client).toBeDefined();
  });

  test('should add error listener', () => {
    const client = createClient({ nodes: [] }, { errorLog: true });

    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(client).toBeDefined();
  });
});
