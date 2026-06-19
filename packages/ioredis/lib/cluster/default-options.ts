import type { ClusterModuleOptions } from './interfaces';

export const defaultClusterModuleOptions: Partial<ClusterModuleOptions> = {
  closeClient: true,
  config: undefined,
  errorLog: true,
  readyLog: false
};
