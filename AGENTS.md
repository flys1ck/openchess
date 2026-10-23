# OpenChess

OpenChess is a cross-platform desktop chess application built with Tauri 2 (Rust backend) and Vue 3 + TypeScript (frontend). It integrates the Stockfish engine, Lichess/Chess.com APIs, and SQLite for local storage.

## Commands

All commands use `bun` as the package manager.

```bash
# Development
bun run dev              # Start Vite dev server (port 1420)
bun tauri dev            # Start full Tauri app with hot-reload
bun run dev:worktree     # Same, isolated per git worktree (see Parallel worktrees)

# Building
bun run build            # TypeScript check + Vite build
bun tauri build          # Full desktop app build

# Code quality (run fmt, lint and types:check before committing; fmt and lint also cover workspace packages)
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
- `services/` — `chessdotcom.ts` (Chess.com API client), `database.ts` (Kysely wrapper). The Lichess API client is the `@flys1ck/lichess-client` workspace package (`packages/lichess-client`, generated from OpenAPI).
- `utilities/` — Pure helper functions (move generation, PGN parsing, audio, validation).
- Path aliases: `@components`, `@services`, `@stores`, `@composables`, `@utilities`, `@assets`, `@data`, `@modules`, and `@/` for `src/` — defined in `tsconfig.json`.

### Backend (`src-tauri/`)

- `main.rs` — Tauri setup: registers plugins (SQL, updater, shell, deep-link, single-instance, http, fs, dialog, opener, process, window-state, and the MCP bridge in dev), runs migrations, initializes state.
- `database.rs` — Diesel database helpers.
- `migrations/` — Diesel SQL migrations. Run automatically on app start.

### Frontend ↔ Backend Communication

- **Tauri commands** (`invoke`): used for triggering engine evaluation and one-shot Rust operations.
- **Tauri window events**: Stockfish streams `bestmove` and `info` events back to the frontend asynchronously.
- **Tauri SQL plugin**: frontend queries SQLite directly via Kysely through the plugin.

### Database

Kysely provides type-safe query building. Types are generated from the SQLite schema with `bun run db:gen:types`. When adding new migrations, regenerate types afterward. Always refer to `src/database.d.ts` for column types.

## Development Notes

- **Stockfish binary**: Downloaded separately via `bun run scripts/downloadStockfish.ts`. Required for `tauri dev` / `tauri build`.
- **Issues**: Tracked in GitHub Issues. Older commits and branches use an `OCS-<number>` prefix from the previous Linear setup; do not use it for new work.
- **Branches**: `<type>/<short-description>`, e.g. `fix/promotion-overlay-flipped`. No issue number in the branch name.

## Code Comments

- Default to no comments. Names and structure should carry the meaning.
- Add a comment only for a non-obvious _why_: a workaround, a constraint from an external API/library, a surprising edge case, or a deliberate trade-off.
- Never narrate what the code does, restate the function name, or describe the change you just made ("// added X", "// fixed bug").
- Do not add JSDoc/rustdoc to internal helpers unless the signature alone is ambiguous.
- Keep existing comments accurate; delete ones your change makes stale.

## Parallel worktrees

Parallel PRs each get a git worktree (Claude Code puts them in `.claude/worktrees/`). Start the app there with `bun run dev:worktree`, not `bun tauri dev`. In the main checkout the script deletes the `com.openchess.dev.<worktree-name>` data folders of worktrees that `git worktree list` no longer shows, then runs `bun tauri dev`. In a worktree it does that cleanup too, and:

- sets the identifier to `com.openchess.dev.<worktree-name>`, which gives the worktree its own single-instance lock and app data folder;
- runs Vite on its own port (from 1421 up, via `VITE_PORT`), and adds the worktree name to the window title;
- on first run, copies the main checkout's database into that data folder, so the branch's migrations only touch the copy. Delete the copy to seed it again;
- copies `src-tauri/bin/` (Stockfish sidecar) from the main checkout if it is missing. `.worktreeinclude` already does this for worktrees Claude Code creates.

Worktree builds share Cargo's intermediate files (`CARGO_BUILD_BUILD_DIR`, in the main checkout's `src-tauri/target/worktrees/`). A new worktree only compiles the `openchess` crate, and the binary still lands in its own `src-tauri/target`. Concurrent worktree builds wait for each other (`Blocking waiting for file lock on build directory`); that is expected. Do not add sccache for this: its cache keys include the checkout path, so it barely helps across worktrees.

## Tauri MCP

Verify UI in the running desktop app, not a browser tab. The Vite page alone will fail, because it needs Tauri (`plugin-sql` `invoke`). In a worktree, start your own instance with `bun run dev:worktree`; it does not collide with the user's app. In the main checkout, do not start `bun tauri dev` if the user already has the app open (single-instance; Vite is pinned to port 1420).

The MCP Bridge plugin takes the first free port from **9223** up (9223–9322), so every running instance has its own. Read it from the dev log line `MCP Bridge plugin initialized for 'OpenChess' (<identifier>) on 0.0.0.0:<port>`, and check that the identifier is the one for your worktree. Drive it with the `tauri` MCP server (`@hypothesi/tauri-mcp-server`, configured in `.mcp.json` for Claude Code and `.cursor/mcp.json` for Cursor). Its tools appear as `mcp__tauri__*`.

With the app running:

1. Call `driver_session` with `action: "start"` and the `port` from the log line (use `status` to check, `stop` to end).
2. Use the `webview_*` tools: `webview_screenshot`, `webview_dom_snapshot`, `webview_find_element`, `webview_interact`, `webview_keyboard`, `webview_execute_js`, `webview_wait_for`.
3. Use `read_logs` (`source: "console"`) for webview console output, and `ipc_monitor` / `ipc_execute_command` for Tauri IPC.

If `driver_session` fails to connect, check that the app is running and `tauri-plugin-mcp-bridge` is active (dev builds only).

### Habits that matter here

- Soft-navigate with the Vue router. `location.assign` / full reloads can blank the app.
- Prefer `webview_find_element` (with `properties`) or `webview_execute_js` for measured styles and `data-slot` dumps; use `webview_interact` for real clicks (Reka often ignores a synthetic `.click()`).
- Text selectors can match more than one control (nav vs in-page). Pass `nth` or use a CSS selector.
- Screenshots: use `format: "jpeg"` with `maxWidth: 1200`; PNG often times out.
- Do not add browser-only stubs so a normal tab can load the app.
