# Mission Control Dashboard

Mission Control is a Vite + React 18 frontends paired with an Express/tRPC API and a better-sqlite3 database. The UI follows a Linear-inspired brief in `PRD.md`, while `tasklist.md` tracks implementation order.

## Demo

![Mission Control smoke test](docs/media/mission-control-smoke.gif)

## Features

- **Tasks mission board:** List, filter (status, priority, assignee), and page through missions with Linear-style cards, avatars, and priority chips.
- **Optimistic CRUD:** Create, edit, and delete tasks through modal forms with React Query cache updates, pending indicators, and automatic refetches.
- **Robust UX states:** QueryBoundary-powered error fallback, skeleton/loading placeholders, and deterministic BetterSQLite seeds to make every environment look the same.
- **Preview-ready tooling:** HTTPS-aware `npm run preview`, seed helpers, and a Playwright smoke suite so we can verify builds exactly like production.

## Architecture Overview

### Frontend

- Vite + React 18 SPA with React Router for navigation.
- TanStack Query 5 + tRPC client for data fetching/optimistic updates.
- shadcn/ui primitives (Button, Card, Dialog, Form, etc.) plus custom Linear-inspired styling.
- Playwright-driven smoke spec and Vitest + Testing Library unit coverage for components and hooks.

### Backend

- Express 5 server with helmet/cors/compression, exposing `/api/trpc` over HTTP.
- better-sqlite3 database with Drizzle ORM schema + migrations.
- tRPC routers encapsulate task CRUD, filters, and soft-delete semantics.
- Seed + test helpers spin up in-memory databases for Vitest and Playwright automatically.

## Common Scripts

| Command                                                            | Purpose                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `npm run dev`                                                      | Starts Vite + the Express API (via `tsx`) for local development.         |
| `npm run build`                                                    | Type-checks (`tsc -b`) then builds the production bundle.                |
| `npm run preview`                                                  | Serves the built assets; respects HTTPS flags via `scripts/preview.mjs`. |
| `npm run lint`                                                     | Flat ESLint config (React, TypeScript, Vitest globals).                  |
| `npm run test` / `npm run test:watch`                              | Vitest suites (db, routers, React components).                           |
| `npm run test:e2e`                                                 | Builds + runs the Playwright smoke test (create → edit → delete).        |
| `npm run db:generate` / `npm run db:migrate` / `npm run db:studio` | Drizzle schema/migration helpers and Studio UI.                          |

`src/server/db/seeds.ts` contains deterministic data for agents, tasks, and notes. Both Vitest and Playwright rely on the helpers there to reset the database state before each run.

## Testing

| Command              | Purpose                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `npm run test`       | Runs Vitest in CI mode (`--run`) with the Testing Library setup (`src/test/setupTests.ts`). |
| `npm run test:watch` | Interactive Vitest watch mode.                                                              |
| `npm run test:e2e`   | Builds the app, boots the Express + preview servers, then runs `playwright/tasks.spec.ts`.  |

### Playwright Smoke Suite

The config in `playwright.config.ts` boots both the Express API and the production preview build before executing `playwright/tasks.spec.ts`. Key env vars:

- `PLAYWRIGHT_TEST_HOST` (default `127.0.0.1`) – host to bind the preview.
- `MCP_PREVIEW_PORT` (default `4173`) – Vite preview port.
- `MCP_SERVER_PORT` (default `3001`) – Express API port.
- `PLAYWRIGHT_DB_PATH` (default `tmp/e2e.db.sqlite`) – temporary sqlite file that resets every run.
- `PLAYWRIGHT_VIDEO` (default `'retain-on-failure'`) – set to `on` when you want to capture a video/GIF of the flow.

Running `npm run test:e2e` removes the temp DB, rebuilds, then launches both servers automatically. Ensure Playwright browsers are installed (`npx playwright install --with-deps`) the first time.

## Previewing Production Builds

`npm run build` places assets in `dist/`. To inspect the bundle locally:

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
