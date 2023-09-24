/* eslint-env node */
import { execa } from "execa";
import { copyFileSync } from "fs";

let extension = "";
if (process.platform === "win32") {
  extension = ".exe";
}

async function main() {
  const rustInfo = (await execa("rustc", ["-vV"])).stdout;
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
  }

  copyFileSync(`external/stockfish${extension}`, `src-tauri/bin/stockfish-${targetTriple}${extension}`);
  copyFileSync(`external/pgn-extract${extension}`, `src-tauri/bin/pgn-extract-${targetTriple}${extension}`);
}

main().catch((e) => {
  throw e;
});
