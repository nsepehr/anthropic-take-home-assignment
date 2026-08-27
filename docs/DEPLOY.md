# Deploy (Vercel)

The Vite client is served as static files; the Fastify app runs unchanged as one serverless
function (`api/[...path].ts`) behind `/api/*`. `vercel.json` holds all settings; no env vars needed.

**First deploy** (once, from the repo root):

```sh
vercel login && vercel link   # pick/create the project
vercel deploy --prod
```

**Continuous deploy:** in the Vercel dashboard, Project → Settings → Git → connect the GitHub repo.
Every push to `main` then deploys to production; other branches get preview URLs.

**Verify:** `curl https://<url>/api/health` → `{"status":"ok","project":{"loaded":true,...}}`, and
`https://<url>/` renders the diagram. Locally: `vercel build` then inspect `.vercel/output`.

**Rollback:** Vercel dashboard → Deployments → previous deployment → "Promote to Production", or
`vercel rollback` from the CLI.
