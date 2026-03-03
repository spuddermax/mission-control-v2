# Mission Control Dashboard

Mission Control is a Vite + React 18 frontends paired with an Express/tRPC API and a better-sqlite3 database. The UI follows a Linear-inspired brief in `PRD.md`, while `tasklist.md` tracks implementation order.

## Prerequisites

- Node.js 20+ (Corepack-enabled npm)
- SQLite 3 (optional, for inspecting `db.sqlite`)
- mkcert (only if you need HTTPS preview on `mcp.lan`)
- Playwright browsers (`npx playwright install --with-deps`) for the smoke suite

## Installation & Local Development

```bash
npm install
npm run dev
```

`npm run dev` launches both the Vite client (default `http://127.0.0.1:5173`) and the Express API on port `3001` via `tsx`. The client proxies `/api` requests to the local API so CRUD flows mirror production.

## Database Utilities

| Command               | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `npm run db:generate` | Generate Drizzle SQL migrations from the schema.   |
| `npm run db:migrate`  | Apply pending migrations to `db.sqlite`.           |
| `npm run db:studio`   | Launch Drizzle Studio for inspecting/editing data. |

`src/server/db/seeds.ts` contains deterministic data for agents, tasks, and notes. The test suites (Vitest + Playwright) use the helpers in that file to provision in-memory or temporary file-backed databases.

## Testing

| Command              | Purpose                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run test`       | Runs Vitest in CI mode (`--run`) with the React Testing Library setup (`src/test/setupTests.ts`). |
| `npm run test:watch` | Interactive Vitest watch mode.                                                                    |
| `npm run test:e2e`   | Builds the app and runs the Playwright smoke test (create → edit → delete task).                  |

### Playwright Smoke Suite

The config in `playwright.config.ts` boots both the Express API and the production preview build before executing `playwright/tasks.spec.ts`. Key env vars:

- `PLAYWRIGHT_TEST_HOST` (default `127.0.0.1`) – host to bind the preview.
- `MCP_PREVIEW_PORT` (default `4173`) – Vite preview port.
- `MCP_SERVER_PORT` (default `3001`) – Express API port.
- `PLAYWRIGHT_DB_PATH` (default `tmp/e2e.db.sqlite`) – temporary sqlite file that resets every run.

Running `npm run test:e2e` removes the temp DB, rebuilds, then launches both servers automatically. Ensure Playwright browsers are installed (`npx playwright install --with-deps`) the first time.

## Previewing Production Builds

`npm run build` runs `tsc -b` plus `vite build`, placing assets in `dist/`. To inspect the built bundle locally:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

For HTTPS + LAN testing, generate mkcert certificates and set the environment variables consumed by `scripts/preview.mjs`:

```bash
MCP_HTTPS=true \
MCP_HTTPS_CERT=certs/mcp.lan.pem \
MCP_HTTPS_KEY=certs/mcp.lan-key.pem \
npm run preview -- --host mcp.lan --https
```

The script validates that both certificate paths exist before Vite starts, mirroring the deployment checks planned for Section 7.

## Project Roadmap

- `PRD.md` documents product goals, UX, and scope.
- `tasklist.md` defines the ordered engineering checklist (includes commit references when a step is complete).

Always consult those files before picking up the next task—the workflow enforces one checklist item per commit with a mandatory reflection step.
