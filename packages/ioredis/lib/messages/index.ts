import type { Namespace } from '@/interfaces';

import { parseNamespace } from '@/utils/index.js';

export const generateReadyMessage = (namespace: Namespace) =>
  `${parseNamespace(namespace)}: the connection was successfully established`;

export const generateErrorMessage = (namespace: Namespace, message: string) =>
  `${parseNamespace(namespace)}: ${message}`;
