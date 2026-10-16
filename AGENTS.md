# OpenChess

OpenChess is a cross-platform desktop chess application built with Tauri 2 (Rust backend) and Vue 3 + TypeScript (frontend). It integrates the Stockfish engine, Lichess/Chess.com APIs, and SQLite for local storage.

## Commands

All commands use `bun` as the package manager.

```bash
# Development
bun run dev              # Start Vite dev server (port 1420)
bun tauri dev            # Start full Tauri app with hot-reload

# Building
bun run build            # TypeScript check + Vite build
bun tauri build          # Full desktop app build

# Code quality (run all before committing)
bun run fmt              # Format with oxfmt
bun run fmt:check        # Check formatting only
bun run lint             # Lint with oxlint (auto-fix)
bun run lint:check       # Lint check without fixes
bun run types:check      # TypeScript type checking

# Testing
bun run test:unit        # Run Vitest unit tests
bun run test:bench       # Run benchmarks

# Database
bun run db:gen:types     # Regenerate TypeScript types from SQLite schema
```

## Architecture

### Frontend (`src/`)

- `pages/` — File-based routing. Each `.vue` file maps to a route automatically via `vite-plugin-vue-layouts`.
- `composables/` — Core reactive logic lives here. Key composables:
  - `useGame` — active game state and move management
  - `useGameTree` — PGN tree navigation and variation handling
  - `useChessground` — chessground board rendering/interaction
  - `useEvaluation` — real-time Stockfish evaluation via Tauri events
  - `useSetting` — persists individual settings to the SQLite database
- `stores/` — Pinia stores for cross-component state: `useLichess`, `useChessDotCom`, `useSettings`, `useBreadcrumbs`.
- `services/` — API clients: `lichess.ts`, `chessdotcom.ts`, `database.ts` (Kysely wrapper).
- `schemas/` — Zod schemas for runtime validation of Lichess and Chess.com API responses.
- `utilities/` — Pure helper functions (move generation, PGN parsing, audio, validation).
- Path aliases: `@components`, `@services`, `@stores`, `@composables`, `@utilities`, `@schemas`, `@assets` — defined in `tsconfig.json`.

### Backend (`src-tauri/`)

- `main.rs` — Tauri setup: registers plugins (SQL, updater, shell), runs migrations, initializes state.
- `migrations/` — Diesel SQL migrations. Run automatically on app start.

### Frontend ↔ Backend Communication

- **Tauri commands** (`invoke`): used for triggering engine evaluation and one-shot Rust operations.
- **Tauri window events**: Stockfish streams `bestmove` and `info` events back to the frontend asynchronously.
- **Tauri SQL plugin**: frontend queries SQLite directly via Kysely through the plugin.

### Database

Kysely provides type-safe query building. Types are generated from the SQLite schema with `bun run db:gen:types`. When adding new migrations, regenerate types afterward. Always refer to `src/database.d.ts` for column types.

## Development Notes

- **Sidecar binaries**: Stockfish via `bun run scripts/downloadStockfish.ts` and pgn-extract via `bun run scripts/downloadPgnExtract.ts`, then `bun run scripts/generateTargetTriple.ts`. Required for `tauri dev` / `tauri build`.
- **Linear**: Issues are tracked in Linear (project prefix `OCS-`). Branch names follow `OCS-<number>-description` convention based on recent commits.

## Tauri MCP

Verify UI in the running desktop app, not a browser tab. `http://localhost:1420` needs Tauri (`plugin-sql` `invoke`); the Vite page alone will fail. Do not start `bun tauri dev` if the user already has the app open (single-instance; Vite is pinned to port 1420).

The MCP Bridge plugin listens on **port 9223**. Drive it with the project CLI (`@hypothesi/tauri-mcp-cli` in devDependencies). Use the local binary — do not `bunx --bun @hypothesi/tauri-mcp-cli` (that re-resolves the package every call).

```bash
# From the repo root, with `bun tauri dev` already running
bunx tauri-mcp driver-session start --port 9223 --json
bunx tauri-mcp webview-execute-js --json --script 'location.href'
bunx tauri-mcp webview-interact --action click --selector "#submit-btn"
bunx tauri-mcp webview-screenshot --format jpeg --quality 80 --max-width 1200 --call-timeout 20000 --file-path /tmp/openchess.jpg --json
bunx tauri-mcp driver-session status --json
bunx tauri-mcp driver-session stop --json
```

`bunx tauri-mcp` resolves to `node_modules/.bin/tauri-mcp`. Same as `./node_modules/.bin/tauri-mcp`.

Session state is kept by a background daemon. If you see “no active session” or a refused connection:

```bash
bunx tauri-mcp daemon restart
bunx tauri-mcp driver-session start --port 9223 --json
```

### Habits that matter here

- Soft-navigate with the Vue router. `location.assign` / full reloads can blank the app.
- Prefer `webview-execute-js` for measured styles and `data-slot` dumps; use `webview-interact` for real clicks (Reka often ignores a synthetic `.click()`).
- Text selectors can match more than one control (nav vs in-page). Pass `--nth` or a CSS selector.
- JPEG screenshots with `--max-width 1200` and `--call-timeout 20000` are more reliable than PNG (PNG often times out).
- Cursor may also expose `@hypothesi/tauri-mcp-server` via `.cursor/mcp.json`. If those tools are not in the session namespace, use this CLI. Do not add browser-only stubs so a normal tab can load the app.
