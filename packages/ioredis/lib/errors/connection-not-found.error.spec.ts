import { ConnectionNotFoundError } from './connection-not-found.error.js';

describe('ConnectionNotFoundError', () => {
  test('should create an instance', () => {
    const error = new ConnectionNotFoundError('name');

    expect(error.name).toBe(ConnectionNotFoundError.name);
    expect(error.message).toBe('Connection "name" was not found.');
    expect(error.stack).toBeDefined();
  });
});
