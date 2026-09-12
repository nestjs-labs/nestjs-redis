import type { ClusterClients } from './interfaces/index.js';

import { vi } from 'vitest';

import { ClusterCleanupProvider } from './cluster-cleanup.provider.js';
import { logger } from './cluster-logger.js';

vi.mock('./cluster-logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('ClusterCleanupProvider', () => {
  const mockError = vi.mocked(logger.error);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('quits ready clients on application shutdown', async () => {
    const client = {
      disconnect: vi.fn(),
      quit: vi.fn().mockRejectedValue(new Error('quit failed')),
      status: 'ready'
    };
    const clients = new Map([['default', client]]) as unknown as ClusterClients;
    const provider = new ClusterCleanupProvider({ closeClient: true, config: { nodes: [] } }, clients);

    await provider.onApplicationShutdown();

    expect(client.quit).toHaveBeenCalledTimes(1);
    expect(client.disconnect).not.toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('disconnects clients that are not ready', async () => {
    const client = {
      disconnect: vi.fn(),
      quit: vi.fn(),
      status: 'connecting'
    };
    const clients = new Map([['default', client]]) as unknown as ClusterClients;
    const provider = new ClusterCleanupProvider({ closeClient: true, config: { nodes: [] } }, clients);

    await provider.onApplicationShutdown();

    expect(client.quit).not.toHaveBeenCalled();
    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });

  test('does not close clients when closeClient is disabled', async () => {
    const client = {
      disconnect: vi.fn(),
      quit: vi.fn(),
      status: 'ready'
    };
    const clients = new Map([['default', client]]) as unknown as ClusterClients;
    const provider = new ClusterCleanupProvider({ closeClient: false, config: { nodes: [] } }, clients);

    await provider.onApplicationShutdown();

    expect(client.quit).not.toHaveBeenCalled();
    expect(client.disconnect).not.toHaveBeenCalled();
  });
});
