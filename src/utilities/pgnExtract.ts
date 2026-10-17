import { join, tempDir } from "@tauri-apps/api/path";
import { remove, writeTextFile } from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";

export const PGN_EXTRACT_SIDECAR = "bin/pgn-extract";

export const PGN_EXTRACT_REPAIR_FLAGS = [
  "--quiet",
  "--keepbroken",
  "--fixtagstrings",
  "--fixresulttags",
  "--nestedcomments",
  "--lichesscommentfix",
  "--addfencastling",
  "--allownullmoves",
] as const;

export class PgnExtractError extends Error {
  readonly diagnostics: string;

  constructor(message: string, diagnostics = "") {
    super(message);
    this.name = "PgnExtractError";
    this.diagnostics = diagnostics;
  }
}

export function selectRepairedPgn(stdout: string, stderr = ""): string {
  if (stdout.trim().length > 0) {
    if (stderr.trim().length > 0) console.warn(stderr);
    return stdout;
  }

  throw new PgnExtractError("pgn-extract produced no games", stderr);
}

export async function repairPgn(pgn: string): Promise<string> {
  const inputPath = await writeInputPgn(pgn);
  try {
    const command = Command.sidecar(PGN_EXTRACT_SIDECAR, [...PGN_EXTRACT_REPAIR_FLAGS, inputPath]);
    const output = await command.execute();
    return selectRepairedPgn(output.stdout, output.stderr);
  } finally {
    await remove(inputPath).catch(() => undefined);
  }
}

async function writeInputPgn(pgn: string): Promise<string> {
  const filename = `pgn-extract-input-${crypto.randomUUID()}.pgn`;
  const inputPath = await join(await tempDir(), filename);
  await writeTextFile(inputPath, pgn);
  return inputPath;
}
