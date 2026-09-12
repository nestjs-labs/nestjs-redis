// @ts-check
import { defineConfig } from 'eslint/config';
import nestEslint from '@nestjs-labs/eslint-config/nest';
import jestEslint from '@nestjs-labs/eslint-config/jest';

export default defineConfig([
  {
    ignores: [
      '**/*.config.mjs',
      '**/.lintstagedrc.mjs',
      '**/global.d.ts',
      'examples/nest-redis-example/**',
    ],
  },
  ...nestEslint,
  ...jestEslint,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  }
]);
