import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'pixi-gantt': path.resolve(rootDir, '../pixi-gantt/src/index.ts'),
    },
  },
  server: {
    port: 5175,
  },
});
