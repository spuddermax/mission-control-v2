# Mission Control Dashboard

Fresh Vite + React 18 foundation for the Mission Control rebuild described in `PRD.md`. The repo currently hosts the frontend scaffold; upcoming tasks will add the API layer, database, and UI components.

## Prerequisites

- Node.js 20+ (uses corepack-enabled npm)
- SQLite installed locally if you want to inspect the future `db.sqlite`

## Getting Started

```bash
# install deps
npm install

# start Vite + API (API stub lands in later tasks)
npm run dev
```

Vite serves the client at <http://localhost:5173> by default.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Launches Vite dev server (API server will be wired in Task 4). |
| `npm run build` | Type-checks (`tsc -b`) then builds the production bundle. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs the flat ESLint config (to be expanded in Task 2). |
| `npm run test` | Reserved for Vitest once suites exist. |

## Project Roadmap

- `tasklist.md` tracks the authoritative step-by-step work plan.
- `PRD.md` explains the product requirements and UX expectations.

Check those docs for the current status before starting new work.
