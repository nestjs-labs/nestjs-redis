import type { Namespace } from '@/interfaces';

import { isString } from './is.js';

/**
 * Parses namespace to string.
 *
 * @param namespace - The namespace
 * @returns A string value
 */
export const parseNamespace = (namespace: Namespace): string =>
  isString(namespace) ? namespace : namespace.toString();
