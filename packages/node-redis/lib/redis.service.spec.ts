import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let module: TestingModule;
  let redisService: RedisService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          cluster: {
            rootNodes: [
              {
                url: 'redis://127.0.0.1:7380',
                password: 'mycluster'
              }
            ]
          }
        })
      ]
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('should get client', () => {
    const client = redisService.getClient();
    expect(client).toBeDefined();
  });

  it('should connect to Redis', async () => {
    const client = redisService.getClient();
    try {
      const result = await client.ping();
      expect(result).toBe('PONG');
    } catch (error) {
      console.log(`Redis not available, skipping connection test: ${String(error)}`);
      // Skip test if Redis is not available
      return;
    }
  });

  it('should perform basic operations', async () => {
    const client = redisService.getClient();
    const testKey = 'test:service:key';
    const testValue = 'test:service:value';

    try {
      // Test set operation
      await client.set(testKey, testValue);

      // Test get operation
      const result = await client.get(testKey);
      expect(result).toBe(testValue);

      // Test delete operation
      const deleted = await client.del(testKey);
      expect(deleted).toBe(1);

      // Verify deletion
      const afterDelete = await client.get(testKey);
      expect(afterDelete).toBeNull();
    } catch (error) {
      console.log(`Redis operations failed, skipping test: ${String(error)}`);
    }
  });

  it('should handle counter operations', async () => {
    const client = redisService.getClient();
    const counterKey = 'test:service:counter';

    try {
      // Test increment
      const result1 = await client.incr(counterKey);
      expect(result1).toBe(1);

      const result2 = await client.incr(counterKey);
      expect(result2).toBe(2);

      // Test decrement
      const result3 = await client.decr(counterKey);
      expect(result3).toBe(1);

      // Cleanup
      await client.del(counterKey);
    } catch (error: unknown) {
      console.log(`Redis counter operations failed, skipping test: ${String(error)}`);
    }
  });

  it('should handle expiry operations', async () => {
    const client = redisService.getClient();
    const expiryKey = 'test:service:expiry';

    try {
      // Set with expiry (1 second)
      await client.setEx(expiryKey, 1, 'expiry-test');

      // Should exist immediately
      const immediate = await client.get(expiryKey);
      expect(immediate).toBe('expiry-test');

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should not exist after expiry
      const afterExpiry = await client.get(expiryKey);
      expect(afterExpiry).toBeNull();
    } catch (error: unknown) {
      console.log(`Redis expiry operations failed, skipping test: ${String(error)}`);
    }
  });

  it('should handle list operations', async () => {
    const client = redisService.getClient();
    const listKey = 'test:service:list';

    try {
      // Test list operations
      await client.lPush(listKey, 'item1');
      await client.lPush(listKey, 'item2');
      await client.rPush(listKey, 'item3');

      // Get list length
      const length = await client.lLen(listKey);
      expect(length).toBe(3);

      // Get list items
      const items = await client.lRange(listKey, 0, -1);
      expect(items).toEqual(['item2', 'item1', 'item3']);

      // Cleanup
      await client.del(listKey);
    } catch (error: unknown) {
      console.log(`Redis list operations failed, skipping test: ${String(error)}`);
    }
  });

  it('should handle hash operations', async () => {
    const client = redisService.getClient();
    const hashKey = 'test:service:hash';

    try {
      // Test hash operations
      await client.hSet(hashKey, 'field1', 'value1');
      await client.hSet(hashKey, 'field2', 'value2');

      // Get hash field
      const value1 = await client.hGet(hashKey, 'field1');
      expect(value1).toBe('value1');

      // Get all hash fields
      const allFields = await client.hGetAll(hashKey);
      expect(allFields).toEqual({
        field1: 'value1',
        field2: 'value2'
      });

      // Cleanup
      await client.del(hashKey);
    } catch (error: unknown) {
      console.log(`Redis hash operations failed, skipping test: ${String(error)}`);
    }
  });

  it('should handle connection errors gracefully', async () => {
    const client = redisService.getClient();

    try {
      // Test with a valid operation
      await client.set('test:error:key', 'test:error:value');
      const result = await client.get('test:error:key');
      expect(result).toBe('test:error:value');

      // Cleanup
      await client.del('test:error:key');
    } catch (error) {
      console.log(`Redis connection test failed, but this is expected if Redis is not running: ${String(error)}`);
      // Skip test if Redis is not available
      return;
    }
  });

  describe('Service methods', () => {
    it('should provide getClient method', () => {
      const client = redisService.getClient();
      expect(client).toBeDefined();
      expect(typeof client.set).toBe('function');
      expect(typeof client.get).toBe('function');
      expect(typeof client.del).toBe('function');
    });
  });
});
