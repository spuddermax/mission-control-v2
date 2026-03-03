# Product Requirements Document: Mission Control Dashboard

**Version:** 1.3 (2026-03-03 00:12 EST)
**Author:** Max MCP Chief of Staff
**Status:** Draft refined after stack review + reset plan

## 1. Overview
Mission Control is a custom web dashboard for the agentic dev team. It serves as the central interface to build, manage, and monitor custom tools (starting with Tasks). Hosted on localhost with optional LAN access at `mcp.lan` (dev HTTPS proxy optional). Linear-inspired clean UI for junior-dev ease.

**Problem Solved:** Retire the overbuilt Next.js experiment (and Grok’s broken scaffolding) in favor of a fresh, lightweight Vite + React MVP dedicated to tasks/tools with a shared SQLite data layer that agents + MCP can both read/write.

**Success Metrics:** Runnable MVP (Tasks CRUD) with <5s load, responsive mobile/desktop experience, git-tracked and pull-request ready, Vitest coverage across critical logic (~70%+, no vanity totals).

## 2. Goals & Scope
- **Primary:** Ship a Tasks tool MVP (list/create/edit/delete/filter/status) backed by SQLite.
- **Future:** Custom tools builder (plugins/components) that can surface agent workflows.
- **Stretch:** Real-time OpenClaw status via WebSockets, Storybook UI docs, agent presence indicators.
- **Non-Goals:** Auth/multi-user (local single user only), advanced visualization (kanban/Gantt later), production hosting (review locally first).

## 3. Features

### MVP scope
- **Tasks:**
  - List view (paginated or infinite scroll) with filters for status, priority, project tag, and assignee.
  - Create/Edit modal (title, description, status, priority, tags, agent assignee) with optimistic updates.
  - Delete via soft-delete flag + confirmation dialog.
  - Status badges (todo/in-progress/blocked/done) and priority chips.
- **UI:** Linear-style sidebar layout, responsive task cards, hover/focus states, Lucide icons. Bootstrap icons removed to avoid duplication with shadcn.
- **Data:** SQLite relational store (agents/tasks/task_notes) shared by MCP + agents.
- **Sync:** Poll + optimistic updates via TanStack Query v5 (WebSockets deferred to stretch).
- **Sidebar:** Tasks nav item live; Tools/Projects/Brief placeholders stubbed or hidden until ready.
- **Testing:** Vitest unit coverage on DB/tRPC/React hooks + smoke E2E stub (Playwright) for CRUD happy path.

### Stretch (post-MVP)
- Custom tools builder surface.
- Real-time OpenClaw/agent status with WebSocket push.
- Storybook/preview docs for reusable UI components.

## 4. Tech Stack (best practices & realistic versions)
| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Vite 5.x + React 18.3 + TypeScript strict | Fast HMR/build; bump to React 19/Vite 6 once stable. |
| UI | Tailwind CSS 3.4 + shadcn/ui (Radix) + Lucide icons | Linear aesthetic, accessible primitives; Bootstrap removed. |
| Routing | React Router 6.27 (upgrade path to v7) | SPA routing + nested layouts. |
| State/API | tRPC v10 + TanStack Query v5 + Zod | End-to-end typing, optimistic updates, validation. |
| DB | Drizzle ORM + better-sqlite3 (WAL enabled) | Typed schema/migrations with local SQLite. |
| Server | Express + tsx dev runner (pm2/HTTPS optional for LAN) | Lightweight dev server; pm2 only when HTTPS preview is required. |
| Lint/Build/Test | ESLint + Prettier + Husky + Vitest (+ Playwright stub) | Enforce quality; target ≥70% coverage on critical modules. |

## 5. Database Schema (relational best practices)
```sql
-- db.sqlite (Drizzle schema.ts relations/seeds)
agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  status TEXT CHECK(status IN ('idle','working','blocked')) DEFAULT 'idle',
  preferred_model TEXT DEFAULT 'grok-4',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('todo','in-progress','blocked','done')) DEFAULT 'todo',
  priority INTEGER DEFAULT 0,
  created_by_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  assignee_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

task_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_by_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  updated_by_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Indexes: tasks(created_by,status,priority,created_at DESC), tasks(assignee_agent_id)
-- task_notes(task_id DESC, created_by_agent_id)
```
- **Relations:** Drizzle one-to-many helpers for agents→tasks→task_notes.
- **Storage:** Enable WAL + `PRAGMA foreign_keys = ON` in `db/index.ts`; share a singleton better-sqlite3 instance.
- **Seeds:** drizzle-kit seeds for baseline agents (MCP, CodeMaster, etc.) + sample tasks to populate the dashboard instantly.
- **Migrations:** `db:generate` + `db:migrate` orchestrated via npm scripts; Vitest seeds a disposable DB before suites.

## 6. API (tRPC procedures)
- `tasks.list({ cursor?, limit = 20, filter?: { status?: Status[], priority?: number[], assigneeId?: number, projectTag?: string } })` → `{ items: Task[], nextCursor? }`.
- `tasks.create(input)` → Task (optimistic insert + invalidate list).
- `tasks.update(id, partial)` → Task (returns updated record; optimistic UI patch).
- `tasks.delete(id)` → `{ success: boolean }` (marks soft-delete flag and removes from active list).

All procedures use Zod validation, typed errors (`TRPCError`), and share an auth-less context (local-only for now).

## 7. UI Components (Linear-style)
- Sidebar: shadcn `NavigationMenu` or custom list with Lucide icons (📋 Tasks live, others stubbed).
- Tasks: shadcn `Card`, `Badge`, `Separator`; modal form built from Dialog/Form components.
- Responsive behavior: Tailwind breakpoints + hamburger nav for mobile.

## 8. Deployment
- **Dev:** `npm run dev` = concurrent Express (3001) + Vite (3000) proxy; HTTPS optional.
- **LAN Preview:** `npm run preview` + mkcert certificates for `mcp.lan` when multi-device testing is needed (pm2 optional, not default).
- **Prod-like:** Build + pm2 ecosystem script only when 443 access is required; otherwise Vite preview suffices for review.

## 9. Testing
- Unit: Vitest (tRPC procedures, DB utilities, React hooks/components).
- Integration: CRUD db↔API↔UI sync with seeded SQLite fixtures.
- E2E: Playwright stub (add/edit task) run against preview build when feasible.

## 10. Risks/Next
- pm2 root access (docker alt) if HTTPS on LAN is mandatory.
- Scalability path to D1/Postgres once multi-user is needed.
- CI: GitHub Actions for lint/build/test once MVP stabilizes.

## 11. Implementation Approach (reset plan)
1. **Purge the broken scaffold** (remove `src/`, config files, and deps Grok touched) except for documentation.
2. **Re-bootstrap** using `npm create vite@latest` (React + TS) inside `projects/mission-control`, then layer Tailwind, shadcn, ESLint, Vitest, Drizzle, Express.
3. **Follow tasklist order** (DB → backend → frontend → polish) referencing this PRD explicitly at each step.
4. **Document each phase** via commits so regressions are easy to bisect.

Review good? Agent coding session build? 🚀
