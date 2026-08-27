import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @app/shared to source so tests need no `npm run build -w shared` first.
export default defineConfig({
  resolve: {
    alias: { '@app/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)) },
  },
  test: { env: { NODE_ENV: 'test' } },
});
