# Product Requirements Document: Mission Control Dashboard

**Version:** 1.1 (2026-03-02 22:33 EST)
**Author:** Max MCP Chief of Staff
**Status:** Draft Refined for Review

## 1. Overview
Mission Control is a custom web dashboard for the agentic dev team. It serves as a central interface to build, manage, and monitor custom tools (starting with Tasks). Hosted on localhost with LAN access at mcp.lan (ports 80/443 HTTPS). Linear-inspired clean UI for junior-dev ease.

**Problem Solved:** Overkill NextJS WIP → lightweight Vite React MVP for tasks/tools. Shared SQLite data for agents/MCP sync.

**Success Metrics:** Runnable MVP (CRUD tasks), <5s load, responsive mobile/desktop, git tracked pull request-ready, Vitest 80% coverage.

## 2. Goals & Scope
- **Primary:** Tasks tool MVP (list/create/edit/delete/filter/status).
- **Future:** Custom tools builder (plugins/components).
- **Stretch:** Real-time WS OpenClaw status, Storybook UI docs.
- **Non-Goals:** Auth/multi-user (local/single), advanced viz (kanban later), prod deploy (review first).

## 3. Features (MVP)
- **Tasks:**
  - List: Infinite scroll/grid/cards, filter status/project/priority.
  - Create/Edit: Modal form (title/desc/status/priority/tags/agent assignee).
  - Delete: Soft-delete + confirm.
  - Status: todo/in-progress/blocked/done (badges/colors).
- **UI:** Linear style (sidebar nav, clean cards, hover, responsive Bootstrap/Lucide icons headers).
- **Data:** SQLite relational (tasks/agents/task_notes).
- **Real-time:** Poll optimistic or WS (stretch).
- **Sidebar:** Tasks (MVP), future Tools/Projects/Brief.
- **Testing:** Vitest unit (CRUD), e2e stub (Playwright?).

## 4. Tech Stack (Best Practices)
| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Vite 6 + React 19 + TS strict | Fast HMR/build, typesafe. |
| UI | Tailwind v4 + shadcn/ui + Lucide/Bootstrap icons | Linear clean, accessible, icons headers/titles. |
| Routing | React Router v7 | SPA pages. |
| State/API | tRPC v11 + Tanstack Query v5 + Zod | End-to-end types, optimistic, validation. |
| DB | Drizzle ORM + better-sqlite3 | Relational migrations/queries/seeds typed. |
| Server | Express + pm2 | HTTPS mkcert mcp.lan port 443. |
| Lint/Build/Test | ESLint Prettier Husky Vitest | Clean code, 80% coverage. |

## 5. Database Schema (Relational Best)
```sql
-- db.sqlite (Drizzle schema.ts relations/seeds)
agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,  -- 'Max-MCP', 'CodeMaster'
  status TEXT CHECK(status IN ('idle','working','blocked')) DEFAULT 'idle',
  preferred_model TEXT DEFAULT 'grok-4',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) -- Seed: MCP, CodeMaster etc.

tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('todo','in-progress','blocked','done')) DEFAULT 'todo',
  priority INTEGER DEFAULT 0,
  created_by_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  assignee_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

task_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_by_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Indexes: tasks(created_by,status,priority,created_at DESC), assignee_agent_id
-- task_notes(task_id DESC, created_by_agent_id)
```
- **Relations:** Drizzle 1:many agents→tasks→notes.
- **Seeds:** drizzle-kit seeds/agents (MCP/CodeMaster statuses).
- **Migrations:** push auto, Vitest seed/test.

## 6. API (tRPC Procedures)
- `tasks.list(filter?)` → Task[] paginated.
- `tasks.create(input)` → Task (optimistic).
- `tasks.update(id, partial)` → Task.
- `tasks.delete(id)` → success (invalidate list).

Zod all, TRPCError.

## 7. UI Components (Linear w/ Icons)
- Sidebar: Lucide/Bootstrap icons headers (📋 Tasks).
- Tasks: Cards badges, modal form shadcn.
- Responsive: Mobile hamburger nav.

## 8. Deployment
- Dev: concurrent server:3001 vite:3000 proxy.
- Prod: build + pm2 ecosystem (HTTPS 443 mcp.lan).
- Certs: mkcert mcp.lan /etc/hosts.

## 9. Testing
- Unit: Vitest (tRPC procedures, utils).
- Integration: CRUD db/ui sync.
- E2E: Playwright stub (add/edit task).

## 10. Risks/Next
- pm2 root (docker alt).
- Scale: D1/Postgres.
- CI: GitHub Actions lint/build/test.

Review good? Agent coding session build? 🚀