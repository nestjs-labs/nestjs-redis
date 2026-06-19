import type { ClusterClientOptions } from '../interfaces/index.js';

import { Cluster } from 'ioredis';

import { NAMESPACE_KEY } from '../cluster.constants.js';
import { createClient } from './cluster.utils.js';

jest.mock('../cluster-logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn()
  }
}));

const mockOn = jest.fn();

jest.mock('ioredis', () => ({
  Cluster: jest.fn(() => ({
    disconnect: jest.fn(),
    on: mockOn,
    quit: jest.fn()
  }))
}));

const MockedCluster = Cluster as jest.MockedClass<typeof Cluster>;

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
    const mockOnClientCreated = jest.fn();
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
