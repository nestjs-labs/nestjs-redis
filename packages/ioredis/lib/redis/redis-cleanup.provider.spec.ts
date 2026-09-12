import type { RedisClients } from './interfaces/index.js';

import { vi } from 'vitest';

import { removeListeners } from './common/index.js';
import { RedisCleanupProvider } from './redis-cleanup.provider.js';
import { logger } from './redis-logger.js';

vi.mock('./common/index.js', () => ({
  removeListeners: vi.fn()
}));
vi.mock('./redis-logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('RedisCleanupProvider', () => {
  const mockRemoveListeners = vi.mocked(removeListeners);
  const mockError = vi.mocked(logger.error);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('closes clients and removes listeners on application shutdown', async () => {
    const client = {
      quit: vi.fn().mockRejectedValue(new Error('quit failed')),
      status: 'ready'
    };
    const clients = new Map([['default', client]]) as unknown as RedisClients;
    const provider = new RedisCleanupProvider({ closeClient: true }, clients);

    await provider.onApplicationShutdown();

    expect(client.quit).toHaveBeenCalledTimes(1);
    expect(mockRemoveListeners).toHaveBeenCalledWith(client);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('does not close clients when closeClient is disabled', async () => {
    const client = { quit: vi.fn(), status: 'ready' };
    const clients = new Map([['default', client]]) as unknown as RedisClients;
    const provider = new RedisCleanupProvider({ closeClient: false }, clients);

    await provider.onApplicationShutdown();

    expect(client.quit).not.toHaveBeenCalled();
    expect(mockRemoveListeners).not.toHaveBeenCalled();
  });
});
