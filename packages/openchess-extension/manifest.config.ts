import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "OpenChess",
  version: "0.0.1",
  description: "OpenChess browser extension for Lichess and Chess.com",
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://lichess.org/*", "https://www.chess.com/*"],
      run_at: "document_idle",
    },
  ],
  host_permissions: ["https://lichess.org/*", "https://www.chess.com/*"],
});
