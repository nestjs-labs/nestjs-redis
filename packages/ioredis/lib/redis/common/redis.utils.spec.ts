import type { RedisClientOptions } from '../interfaces/index.js';

import Redis from 'ioredis';

import { NAMESPACE_KEY } from '../redis.constants.js';
import { create } from './redis.utils.js';

jest.mock('../redis-logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn()
  }
}));

const mockOn = jest.fn();

jest.mock('ioredis', () =>
  jest.fn(() => ({
    disconnect: jest.fn(),
    on: mockOn,
    quit: jest.fn()
  }))
);

const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

beforeEach(() => {
  MockedRedis.mockClear();
  mockOn.mockReset();
});

describe('create', () => {
  describe('with URL', () => {
    const url = 'redis://:authpassword@127.0.0.1:6380/4';

    test('should create a client with a URL', () => {
      const client = create({ url }, {});

      expect(client).toBeDefined();
      expect(MockedRedis).toHaveBeenCalledTimes(1);
      expect(MockedRedis).toHaveBeenCalledWith(url, {});
      expect(MockedRedis.mock.instances).toHaveLength(1);
    });

    test('should create a client with a URL and options', () => {
      const client = create({ lazyConnect: true, url }, {});

      expect(client).toBeDefined();
      expect(MockedRedis).toHaveBeenCalledTimes(1);
      expect(MockedRedis).toHaveBeenCalledWith(url, { lazyConnect: true });
      expect(MockedRedis.mock.instances).toHaveLength(1);
    });
  });

  describe('with path', () => {
    test('should create a client with a path', () => {
      const path = '/run/redis.sock';
      const client = create({ lazyConnect: true, path }, {});

      expect(client).toBeDefined();
      expect(MockedRedis).toHaveBeenCalledTimes(1);
      expect(MockedRedis).toHaveBeenCalledWith(path, { lazyConnect: true });
      expect(MockedRedis.mock.instances).toHaveLength(1);
    });
  });

  describe('with options', () => {
    test('should create a client with options', () => {
      const options: RedisClientOptions = { host: '127.0.0.1', port: 6380 };
      const client = create(options, {});

      expect(client).toBeDefined();
      expect(MockedRedis).toHaveBeenCalledTimes(1);
      expect(MockedRedis).toHaveBeenCalledWith(options);
      expect(MockedRedis.mock.instances).toHaveLength(1);
    });

    test('should call onClientCreated', () => {
      const mockOnClientCreated = jest.fn();
      const client = create({ onClientCreated: mockOnClientCreated }, {});

      expect(client).toBeDefined();
      expect(MockedRedis).toHaveBeenCalledTimes(1);
      expect(MockedRedis).toHaveBeenCalledWith({});
      expect(MockedRedis.mock.instances).toHaveLength(1);
      expect(mockOnClientCreated).toHaveBeenCalledTimes(1);
      expect(mockOnClientCreated).toHaveBeenCalledWith(client);
    });
  });

  test('should set namespace correctly', () => {
    const namespace = Symbol();
    const client = create({ namespace }, { errorLog: false, readyLog: false });

    expect(Reflect.get(client, NAMESPACE_KEY)).toBe(namespace);
  });

  test('should add ready listener', () => {
    const client = create({}, { readyLog: true });

    expect(mockOn).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(client).toBeDefined();
  });

  test('should add error listener', () => {
    const client = create({}, { errorLog: true });

    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(client).toBeDefined();
  });
});
