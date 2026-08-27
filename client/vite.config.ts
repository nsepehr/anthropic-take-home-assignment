import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const clientPort = Number(process.env.CLIENT_PORT ?? 5173);
const serverPort = Number(process.env.SERVER_PORT ?? 3001);
const mockApi = process.env.MOCK_API === '1';

/**
 * TEMPORARY (task 03): serve data/project.json as GET /api/project when MOCK_API=1, so the debug
 * page works before the server API (task 02) lands. Remove once 02-api is merged.
 */
function mockProjectApi(): Plugin {
  const seed = readFileSync(
    fileURLToPath(new URL('../data/project.json', import.meta.url)),
    'utf8',
  );
  return {
    name: 'mock-project-api',
    apply: 'serve',
    configureServer(server) {
      if (!mockApi) return;
      server.middlewares.use('/api/project', (_req, res) => {
        res.setHeader('content-type', 'application/json');
        res.end(seed);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockProjectApi()],
  resolve: {
    alias: { '@app/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)) },
  },
  server: {
    port: clientPort,
    strictPort: true,
    // The proxy is registered before plugin middlewares, so it must be off for the mock to answer.
    proxy: mockApi ? undefined : { '/api': `http://127.0.0.1:${serverPort}` },
  },
});
