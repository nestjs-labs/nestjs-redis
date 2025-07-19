// @ts-check
import { defineConfig } from 'eslint/config';
import nestEslint from '@nestjs-labs/eslint-config/nest';
import jestEslint from '@nestjs-labs/eslint-config/jest';

export default defineConfig([
  {
    files: ['**/*.ts', '**/*.js'],
    extends: [nestEslint, jestEslint]
  }
]);
