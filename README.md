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

| Command           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Launches Vite dev server (API server will be wired in Task 4). |
| `npm run build`   | Type-checks (`tsc -b`) then builds the production bundle.      |
| `npm run preview` | Serves the production build locally.                           |
| `npm run lint`    | Runs the flat ESLint config (to be expanded in Task 2).        |
| `npm run test`    | Reserved for Vitest once suites exist.                         |

## LAN Preview over HTTPS (`mcp.lan`)

When you need to test the production build on multiple devices, run the preview server over HTTPS with a certificate for `mcp.lan`:

1. **Install mkcert (one-time):** `mkcert -install`
2. **Generate a LAN cert + key:**
   ```bash
   mkdir -p certs
   mkcert -cert-file certs/mcp.lan.pem -key-file certs/mcp.lan-key.pem mcp.lan
   ```
3. **Point `mcp.lan` at your dev machine** via `/etc/hosts` (or router DNS) – e.g. `192.168.0.65 mcp.lan`.
4. **Build + run the preview server:**
   ```bash
   npm run build
   MCP_HTTPS=true \
   MCP_HTTPS_CERT=certs/mcp.lan.pem \
   MCP_HTTPS_KEY=certs/mcp.lan-key.pem \
   npm run preview -- --host mcp.lan --https
   ```

The `MCP_HTTPS` flag enables HTTPS mode inside `vite.config.ts`; the optional `MCP_HTTPS_CERT`/`MCP_HTTPS_KEY` variables let you point at any mkcert-issued files. If either path is missing the preview command will exit with a helpful error so you know to re-run `mkcert`.

## Project Roadmap

- `tasklist.md` tracks the authoritative step-by-step work plan.
- `PRD.md` explains the product requirements and UX expectations.

Check those docs for the current status before starting new work.
