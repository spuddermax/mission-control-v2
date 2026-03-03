# Mission Control Task List: Implement PRD v1.0

**Status:** Open | Progress: 0/XX | Updated: 2026-03-02 22:27 EST

**Instructions:**
Carefully complete each step in this task list, one by one, and commit with an appropriate best practice commit statement after completing each individual task. Mark each task as completed [X] as you progress.

## 1. Project Setup (Foundation) ✅
- [x] git init projects/mission-control (master/main branch)
- [x] package.json (Vite React TS Tailwind tRPC Drizzle Express lucide)
- [x] npm i (deps + devDeps)
- [x] .gitignore (.env db.sqlite dist node_modules .certs?)
- [x] README.md (setup/dev/prod/mkcert /etc/hosts)
- [x] git add/commit 'chore: init scaffold'

## 2. Config Files
- [ ] tailwind.config.js postcss.config.js prettier.config.js
- [ ] tsconfig.json tsconfig.node.json (strict paths @/*)
- [ ] eslint.config.mjs (react-hooks refresh typescript)
- [ ] vite.config.ts (react plugin alias proxy /api →3001)
- [ ] drizzle.config.ts (schema out dialect sqlite DB_PATH)
- [ ] .env.example (DB_PATH NODE_ENV)
- [ ] Husky lint-staged (pre-commit lint fix format)
- [ ] git commit 'feat: configs (eslint prettier ts vite drizzle tailwind)'

## 3. Database (Drizzle SQLite Relational)
- [ ] src/server/db/schema.ts (agents tasks task_notes tables FK indexes CHECK timestamps)
- [ ] src/server/db/index.ts (singleton db WAL FK ON migrations seed agents MCP etc.)
- [ ] npm run db:generate push:migrate studio (verify db.sqlite)
- [ ] git commit 'feat: db schema migrations seed'

## 4. Backend Server (Express tRPC)
- [ ] src/server/trpc.ts (create tRPC router context)
- [ ] src/server/routers/tasks.ts (list create update delete Zod TRPCError)
- [ ] src/server/index.ts (Express cors helmet compression tRPC /api/trpc/* HTTPS mkcert dev 3001)
- [ ] ecosystem.config.cjs (pm2 prod 443 cluster)
- [ ] npm run server:dev (test API Postman/curl)
- [ ] git commit 'feat: express tRPC api tasks'

## 5. Frontend (Vite React UI Linear Style)
- [ ] src/main.tsx providers.tsx (QueryClient tRPCReactProvider BrowserRouter)
- [ ] src/App.tsx (Layout Sidebar main Routes /tasks TaskList)
- [ ] src/components/Sidebar.tsx (nav links icons responsive)
- [ ] src/components/TaskList.tsx (Tanstack Query trpc.tasks.list grid cards filter status)
- [ ] src/components/TaskCard.tsx (title status desc actions edit/delete hover)
- [ ] src/components/CreateTaskModal.tsx (form Zod optimistic shadcn dialog button)
- [ ] src/index.css (@tailwind + globals)
- [ ] npm run dev (vite + proxy test CRUD UI)
- [ ] git commit 'feat: ui tasks list modal router'

## 6. Integrations/Polish
- [ ] shadcn/ui init add button dialog card input badge table (Linear theme)
- [ ] utils/trpc.ts (AppRouter type client infer)
- [ ] Responsive/mobile (Tailwind)
- [ ] Error boundaries loading skeletons
- [ ] git commit 'feat: shadcn polish responsive'

## 7. Deploy & Test
- [ ] mkcert mcp.lan /etc/hosts 127.0.0.1
- [ ] npm run build
- [ ] pm2 start ecosystem (test https mcp.lan:443)
- [ ] E2E: CRUD tasks UI/DB sync, refresh data
- [ ] Lint format typecheck pass
- [ ] git commit 'chore: deploy pm2 mkcert'

## 8. Review & Remote
- [ ] MVP demo localhost/mcp.lan
- [ ] User review/feedback
- [ ] Push remote gh repo fork/PR

**Blockers:** mkcert sudo, pm2 root (elevated).
**Est Time:** 2-4h ACP auto.

Start #1? 🚀