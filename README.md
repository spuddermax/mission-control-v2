# Mission Control Dashboard MVP

Linear-inspired tasks manager (Vite React Tailwind tRPC Drizzle).

## Quickstart Dev
1. `npm i`
2. `npm run db:migrate`  # db.sqlite auto
3. `mkcert mcp.lan` + `/etc/hosts 127.0.0.1 mcp.lan`
4. `npm run dev` → localhost:3000 (hot-reload)

Prod Preview:
`npm run preview` → https://mcp.lan:4173

Scripts:
- db:studio (Turso-like explorer)
- lint:fix format typecheck

## Structure
- src/server/db/schema.ts (agents/tasks/notes)
- src/server/routers/tasks.ts (tRPC CRUD Zod)
- src/App.tsx (Router Sidebar Tasks)
- shadcn components (card modal)

git branch main; remote add origin...