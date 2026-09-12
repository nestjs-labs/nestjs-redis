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
    coverage: {
      exclude: ['**/interfaces/**', '**/*.spec.ts', '**/node_modules/**'],
      include: ['lib/**/*.ts'],
      provider: 'v8',
      reporter: ['json-summary'],
      reportsDirectory: './coverage'
    },
    globals: true,
    include: ['lib/**/*.spec.ts'],
    root: './'
  }
});
