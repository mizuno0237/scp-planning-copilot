import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'pixi-gantt': path.resolve(rootDir, '../pixi-gantt/src/index.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
