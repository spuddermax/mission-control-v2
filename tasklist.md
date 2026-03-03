# Mission Control Task List — Reset after Grok

**Status:** Reset planned | Updated: 2026-03-03 00:14 EST

## Instructions (must follow for every task item)

1. Work **one task item at a time** in the order listed below—no batching unless a sub-bullet explicitly depends on the previous line.
2. When you believe a task item is finished, **pause and ask yourself:** “Ok, is there anything in what I just coded that I would change? What would I do differently?” Capture fixes immediately before committing.
3. After the reflection, create a dedicated git commit for that single task item (use descriptive messages like `feat: set up tailwind config`). No multi-task commits.
4. Only move to the next task once the previous one is fully committed and double-checked.
5. Mark each task as complete in this tasklist by filling in the checkbox: "[x] {commit-id}"

## 0. Reset & Bootstrap

- [x] 567f719 Remove broken `src/`, config artifacts, and stale deps (keep docs: PRD.md, README.md, tasklist.md).
- [x] 567f719 `npm init`/`npm create vite@latest` (React + TS) in `projects/mission-control`.
- [x] 567f719 Commit `chore: rebootstrap mission-control (clean slate)`.

## 1. Baseline Config (Fresh Project)

- [x] ca2e06e Install core deps: React 18.3, React Router 6.27, TanStack Query 5, tRPC v10, zod, Express, better-sqlite3, drizzle-orm, shadcn/ui, lucide-react.
- [x] ae6853a Install dev deps: Vite 5.x, TypeScript 5.8, ESLint + plugins, Prettier, Tailwind 3.4, Vitest, Playwright stub, tsx, drizzle-kit, Husky + lint-staged.
- [x] 77d64be `.gitignore` (node_modules, dist, db.sqlite, drizzle/, .env\*, certs, etc.).
- [x] 6675976 README.md updated with fresh install/dev instructions.

## 2. Tooling & Config Files

- [x] cb4f486 Tailwind + postcss config (shadcn presets, content paths).
- [x] 756fcb9 `tsconfig.json` + `tsconfig.node.json` (strict, paths @/\*).
- [x] 7a0fcd4 `vite.config.ts` (React plugin, alias @, `/api` proxy, HTTPS toggle for mcp.lan).
- [x] eb963aa ESLint flat config + Prettier config.
- [x] 28957bd Husky + lint-staged hook for lint/test gate.
- [x] 6097e84 Vitest config + `setupTests.ts`.

## 3. Database Layer

- [x] 2ab7e25 `src/server/db/schema.ts` with agents/tasks/task_notes tables (updated_at, deleted_at, updated_by columns, indexes, relations helper).
- [x] 9f1eb15 `src/server/db/index.ts` (better-sqlite3 singleton, WAL, FK pragma, migrations bootstrap).
- [x] 9ed0eae npm scripts: `db:generate`, `db:migrate`, `db:studio`.
- [x] f54c1df Seeds for baseline agents/tasks + Vitest seed helper.

## 4. Backend API

- [ ] `src/server/trpc.ts` (context, routers, error formatter).
- [ ] `src/server/routers/tasks.ts` (list/create/update/delete per PRD filters, soft-delete handling).
- [ ] `src/server/index.ts` (Express app, helmet/cors/compression, `/api/trpc` handler, health endpoint, port 3001).
- [ ] Dev script `npm run server:dev` (tsx watch) wired into `npm run dev` alongside Vite.

## 5. Frontend (Vite React UI)

- [ ] `src/main.tsx` with QueryClientProvider, TRPC provider, Router.
- [ ] `src/App.tsx` layout + routes (Tasks page default, nav placeholders hidden).
- [ ] Components: Sidebar, TaskList, TaskCard, Filters, Create/Edit modal, Delete confirm dialog.
- [ ] Global styles (`src/index.css`) aligned with Linear aesthetic.

## 6. Integrations & Polish

- [ ] shadcn/ui init + component imports (Button, Card, Dialog, Badge, Separator, Input, Select, Form).
- [ ] `utils/trpc.ts` for strongly-typed client.
- [ ] Loading states, error boundaries, optimistic mutation UX.
- [ ] Theme tokens (colors, spacing) + iconography pass.

## 7. Testing & Deploy Prep

- [ ] Vitest suites: DB/tRPC unit tests + React hooks/components.
- [ ] Playwright smoke stub (create/edit task) using preview build.
- [ ] `npm run build` + `npm run preview --host mcp.lan --https` verification (mkcert instructions in README).
- [ ] Document future pm2 deployment (optional) + create demo plan.

## 8. Review & Handoff

- [ ] Record screencap/gif of MVP flow.
- [ ] Final README update (features, scripts, architecture notes).
- [ ] Push branch + create pull request for review.
