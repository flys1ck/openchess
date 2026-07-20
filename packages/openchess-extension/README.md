# OpenChess Browser Extension

TypeScript browser extension built with [CRXJS](https://crxjs.dev/) and Vite.

## Development

```bash
# From the monorepo root
bun install

# Start the extension dev server (from this package)
bun run dev
```

CRXJS writes a loadable extension to `dist/` and rebuilds on file changes.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `packages/openchess-extension/dist` folder

After the first load, reload the extension from the extensions page when CRXJS rebuilds.

## Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `bun run dev`         | Build extension with HMR    |
| `bun run build`       | Production build to `dist/` |
| `bun run types:check` | TypeScript check            |
| `bun run lint`        | Lint with oxlint            |
| `bun run fmt`         | Format with oxfmt           |

## Project structure

```
src/
  background/   Service worker
  content/      Content scripts injected on Lichess and Chess.com
```

Manifest configuration lives in `manifest.config.ts`.
