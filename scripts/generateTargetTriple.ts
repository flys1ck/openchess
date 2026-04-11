import { execSync } from "child_process";
import { copyFileSync } from "fs";

const extension = process.platform === "win32" ? ".exe" : "";

async function main() {
  const targetTriple = execSync("rustc --print host-tuple").toString().trim();
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
  }
  copyFileSync(`external/stockfish${extension}`, `src-tauri/bin/stockfish-${targetTriple}${extension}`);
}

main().catch((e) => {
  throw e;
});
