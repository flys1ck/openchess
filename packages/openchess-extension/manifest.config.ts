import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "OpenChess",
  version: "0.0.1",
  description: "OpenChess browser extension for Lichess and Chess.com",
  action: {
    default_popup: "src/popup/index.html",
    default_title: "OpenChess",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: [
        "https://lichess.org/*",
        "https://www.chess.com/game/live/*",
        "https://www.chess.com/analysis/game/live/*",
      ],
      run_at: "document_idle",
    },
  ],
  permissions: ["storage", "activeTab"],
  host_permissions: ["https://lichess.org/*", "https://www.chess.com/*"],
});
