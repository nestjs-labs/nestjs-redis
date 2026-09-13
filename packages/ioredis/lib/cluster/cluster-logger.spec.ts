import { Logger } from '@nestjs/common';
import { vi } from 'vitest';

import { logger } from './cluster-logger.js';

vi.mock('@nestjs/common', () => ({
  Logger: vi.fn()
}));

describe('logger', () => {
  test('should be defined', () => {
    expect(logger).toBeInstanceOf(Logger);
    expect(Logger).toHaveBeenCalledTimes(1);
  });
});
