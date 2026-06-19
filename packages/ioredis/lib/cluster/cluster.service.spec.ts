import type { ClusterClients } from './interfaces/index.js';

import { Test, type TestingModule } from '@nestjs/testing';
import { Cluster } from 'ioredis';

import { CLUSTER_CLIENTS, DEFAULT_CLUSTER } from './cluster.constants.js';
import { ClusterService } from './cluster.service.js';

jest.mock('ioredis', () => ({
  Cluster: jest.fn(() => ({}))
}));

describe('ClusterService', () => {
  let clients: ClusterClients;
  let service: ClusterService;

  beforeEach(async () => {
    clients = new Map();
    clients.set(DEFAULT_CLUSTER, new Cluster([]));
    clients.set('client1', new Cluster([]));

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CLUSTER_CLIENTS, useValue: clients }, ClusterService]
    }).compile();

    service = module.get<ClusterService>(ClusterService);
  });

  test('should get a client with namespace', () => {
    expect(service.getOrThrow('client1')).toBeDefined();
  });

  test('should get default client with namespace', () => {
    expect(service.getOrThrow(DEFAULT_CLUSTER)).toBeDefined();
  });

  test('should get default client without namespace', () => {
    expect(service.getOrThrow()).toBeDefined();
  });

  test('should return null for unknown namespace', () => {
    expect(service.getOrNil('')).toBeNull();
  });

  test('should throw an error when getting a client with an unknown namespace', () => {
    expect(() => service.getOrThrow('')).toThrow();
  });
});
