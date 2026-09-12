import { defaultRedisModuleOptions } from './default-options.js';

describe('defaultRedisModuleOptions', () => {
  test('should validate the defaultRedisModuleOptions', () => {
    expect(defaultRedisModuleOptions.closeClient).toBe(true);
    expect(defaultRedisModuleOptions.readyLog).toBe(true);
    expect(defaultRedisModuleOptions.errorLog).toBe(true);
    expect(defaultRedisModuleOptions.config).toEqual({});
    expect(defaultRedisModuleOptions.commonOptions).toBeUndefined();
  });
});
