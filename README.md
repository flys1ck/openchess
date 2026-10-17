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

**2. Download sidecars and generate Tauri binary names**

Stockfish and pgn-extract are not committed to the repository. Download or build them for your platform:

```bash
bun run scripts/downloadStockfish.ts
bun run scripts/downloadPgnExtract.ts
```

Stockfish is fetched as a prebuilt. pgn-extract is compiled from the 26-04 source on macOS and Linux (`make` / a C compiler are required) and downloaded as the official 64-bit exe on Windows. Both land in `external/`. Run this once, or again when a sidecar version changes. Tauri requires each binary to be named with a target triple suffix:

```bash
bun run scripts/generateTargetTriple.ts
```

**3. Start the app**

```bash
bun tauri dev
```

## Updating sidecars

Find new Stockfish releases on the [official Stockfish releases page](https://github.com/official-stockfish/Stockfish/releases). pgn-extract releases are listed on [David Barnes' pgn-extract page](https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract/). Set `STOCKFISH_VERSION` and/or `PGN_EXTRACT_VERSION` in your local environment, then run:

```bash
bun run scripts/downloadStockfish.ts
bun run scripts/downloadPgnExtract.ts
bun run scripts/generateTargetTriple.ts
```

The download scripts place binaries in `external/`. `generateTargetTriple.ts` copies them to `src-tauri/bin/` with the host (or `TARGET_TRIPLE`) suffix. Restart `bun tauri dev` after updating a binary. If the app still uses the previous binary, remove the debug build before restarting:

```bash
rm -rf src-tauri/target/debug
```

pgn-extract is GPL-3.0. OpenChess ships it as a separate sidecar; see [`third_party/pgn-extract/NOTICE`](third_party/pgn-extract/NOTICE) and [`third_party/pgn-extract/COPYING`](third_party/pgn-extract/COPYING).

To run the official pgn-extract repair/normalize oracles against the local sidecar:

```bash
bun run scripts/testPgnExtract.ts
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

| Secret                               | Purpose                       |
| ------------------------------------ | ----------------------------- |
| `STOCKFISH_VERSION`                  | Stockfish version             |
| `PGN_EXTRACT_VERSION`                | pgn-extract version (`26-04`) |
| `TAURI_SIGNING_PRIVATE_KEY`          | Signs update artifacts        |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password for the signing key  |

## IDE Setup

VS Code with the following extensions:

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) — Vue 3 language support
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) — Tauri tooling
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) — Rust language support
