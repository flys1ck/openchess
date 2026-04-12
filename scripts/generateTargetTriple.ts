import { execSync } from "child_process";
import { copyFileSync, mkdirSync } from "fs";

const EXTENSION = process.platform === "win32" ? ".exe" : "";

const STOCKFISH_SOURCE_PATH = `external/stockfish${EXTENSION}`;
const SIDECAR_DIRECTORY = "src-tauri/bin";

async function main() {
  const targetTriple = execSync("rustc --print host-tuple").toString().trim();
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
    process.exit(1);
  }
  mkdirSync(SIDECAR_DIRECTORY, { recursive: true });
  copyFileSync(STOCKFISH_SOURCE_PATH, `${SIDECAR_DIRECTORY}/stockfish-${targetTriple}${EXTENSION}`);
}

main().catch((e) => {
  throw e;
});
