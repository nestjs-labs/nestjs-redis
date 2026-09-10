// @ts-check
import { defineConfig } from 'eslint/config';
import nestEslint from '@nestjs-labs/eslint-config/nest';
import jestEslint from '@nestjs-labs/eslint-config/jest';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', 'coverage'],
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
  },
]);
