# OpenChess

A cross-platform desktop chess application built with Tauri and Vue 3.

- **Frontend**: Vue 3 + TypeScript + Vite + TailwindCSS
- **Backend**: Rust (Tauri 2)
- **Database**: SQLite via Tauri SQL plugin, with Kysely for type-safe queries and Diesel for migrations
- **Package manager**: Bun

## Prerequisites

- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/)
- Linux only:

```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libayatana-appindicator3-dev webkit2gtk-driver xvfb
```

## Local Development

**1. Install dependencies**

```bash
bun install
```

**2. Download Stockfish and generate Tauri binary sidecar**

The Stockfish binary is not committed to the repository. Download it for your platform:

```bash
bun run scripts/downloadStockfish.ts
```

This places the binary in `external/stockfish/`. It only needs to be run once (or when the Stockfish version changes). Tauri requires the binary to be named with a target triple suffix. Run:

```bash
bun run scripts/generateTargetTriple.ts
```

**3. Start the app**

```bash
bun tauri dev
```

## Code Quality

```bash
bun run fmt           # Format (oxfmt)
bun run lint          # Lint with auto-fix (oxlint)
bun run types:check   # TypeScript type checking
bun run test:unit     # Unit tests (Vitest)
```

## Building a Release Locally

```bash
bun tauri build
```

The bundled app (`.app`, `.dmg`, `.deb`, `.exe`, etc.) is output to `src-tauri/target/release/bundle/`.

The app version is read from `package.json`. To cut a new version, update the `version` field there — `tauri.conf.json` reads it via `"version": "../package.json"`.

## Release workflow

Triggered manually via GitHub workflow. Builds the app in parallel across the targets:

| Runner           | Arch           | Output               |
| ---------------- | -------------- | -------------------- |
| `macos-latest`   | ARM64 (M1+)    | `.dmg` / `.app`      |
| `macos-latest`   | x86_64 (Intel) | `.dmg` / `.app`      |
| `ubuntu-22.04`   | x86_64         | `.deb` / `.AppImage` |
| `windows-latest` | x86_64         | `.exe` / `.msi`      |

Creates a **draft** GitHub release named `OpenChess v<version>` with auto-generated release notes and attaches all platform artifacts. Publish the draft manually once you've reviewed it. The release also produces a `latest.json` updater manifest consumed by the in-app auto-updater endpoint configured in `tauri.conf.json`.

### Required environment variables

| Secret                               | Purpose                      |
| ------------------------------------ | ---------------------------- |
| `STOCKFISH_VERSION`                  | Stockfish version            |
| `TAURI_SIGNING_PRIVATE_KEY`          | Signs update artifacts       |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password for the signing key |

## IDE Setup

VS Code with the following extensions:

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) — Vue 3 language support
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) — Tauri tooling
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) — Rust language support
