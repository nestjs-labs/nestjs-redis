import { MissingConfigurationsError } from './missing-configurations.error';

describe('MissingConfigurationsError', () => {
  test('should create an instance', () => {
    const error = new MissingConfigurationsError();

    expect(error.name).toBe(MissingConfigurationsError.name);
    expect(error.message).toEqual(expect.any(String));
    expect(error.stack).toBeDefined();
  });
});
