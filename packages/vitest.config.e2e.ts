import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      jsc: {
        parser: { decorators: true, syntax: 'typescript' },
        transform: { decoratorMetadata: true, legacyDecorator: true }
      }
    })
  ],
  test: {
    fileParallelism: false,
    globals: true,
    include: ['**/*.e2e-spec.ts'],
    root: './'
  }
});
