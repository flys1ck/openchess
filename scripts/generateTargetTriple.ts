/* eslint-env node */
import { renameSync } from "node:fs";

let extension = "";
if (process.platform === "win32") {
  extension = ".exe";
}
async function main() {
  const proc = Bun.spawn(["rustc", "-vV"]);
  const rustInfo = await new Response(proc.stdout).text();
  const targetTriple = /host: (\S+)/g.exec(rustInfo)![1];
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
  }
  renameSync(`src-tauri/bin/stockfish${extension}`, `src-tauri/bin/stockfish-${targetTriple}${extension}`);
}

main().catch((e) => {
  throw e;
});
