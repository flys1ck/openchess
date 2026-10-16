/* oxlint-disable no-console */
import { execSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync } from "fs";

const SIDECAR_DIRECTORY = "src-tauri/bin";

function sidecarExtension(targetTriple: string): string {
  return targetTriple.endsWith("-windows-msvc") ? ".exe" : "";
}

function copySidecar(name: string, targetTriple: string): void {
  const extension = sidecarExtension(targetTriple);
  const sourcePath = `external/${name}${extension}`;
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing sidecar source at ${sourcePath}. Run the matching download script first.`);
  }

  copyFileSync(sourcePath, `${SIDECAR_DIRECTORY}/${name}-${targetTriple}${extension}`);
}

async function main() {
  const targetTriple = process.env.TARGET_TRIPLE ?? execSync("rustc --print host-tuple").toString().trim();
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
    process.exit(1);
  }

  mkdirSync(SIDECAR_DIRECTORY, { recursive: true });
  copySidecar("stockfish", targetTriple);
  copySidecar("pgn-extract", targetTriple);
}

main().catch((error: unknown) => {
  throw error;
});
