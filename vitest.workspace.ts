import { fileURLToPath } from 'node:url';

export default [
  'client',
  'server',
  'shared',
  // The Vercel function lives outside the npm workspaces; its test sits under `api/_test/` because
  // Vercel turns every other `api/*.ts` file into a function (`_`-prefixed paths are skipped).
  {
    resolve: {
      alias: { '@app/shared': fileURLToPath(new URL('./shared/src/index.ts', import.meta.url)) },
    },
    test: { name: 'api', root: 'api', env: { NODE_ENV: 'test' } },
  },
];
