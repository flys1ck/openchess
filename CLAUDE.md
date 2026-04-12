# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenChess is a cross-platform desktop chess application built with Tauri 2 (Rust backend) and Vue 3 + TypeScript (frontend). It integrates the Stockfish 18 engine, Lichess/Chess.com APIs, and SQLite for local storage.

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

`.claude/settings.json` hooks auto-run `fmt` and `lint` after file edits.

## Architecture

### Frontend (`src/`)

- `pages/` — File-based routing. Each `.vue` file maps to a route automatically via `vite-plugin-vue-layouts`.
- `composables/` — Core reactive logic lives here. Key composables:
  - `useGame` — active game state and move management
  - `useGameTree` — PGN tree navigation and variation handling
  - `useChessground` — chessground board rendering/interaction
  - `useEvaluation` — real-time Stockfish evaluation via Tauri events
  - `useSetting` — persists individual settings to the SQLite database
- `stores/` — Pinia stores for cross-component state: `useLichess`, `useChessDotCom`, `useToasts`, `useBreadcrumbs`.
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

Kysely provides type-safe query building. Types are generated from the SQLite schema with `bun run db:gen:types`. When adding new migrations, regenerate types afterward. Always refer to `src/database.d.ts` for

## Development Notes

- **Stockfish binary**: Downloaded separately via `bun run scripts/downloadStockfish.ts`. Required for `tauri dev` / `tauri build`.
- **Linear**: Issues are tracked in Linear (project prefix `OCS-`). Branch names follow `OCS-<number>-description` convention based on recent commits.
