/* oxlint-disable no-console */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const OFFICIAL_TEST_TARGETS = [
  "no-flags-2",
  "test-promotion",
  "test-long-line",
  "test-fixresulttags",
  "test-nestedcomments",
  "test-nobadresults",
  "test-allownullmoves",
] as const;

function findMakefileDirectory(root: string): string {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  if (entries.some((entry) => entry.isFile() && entry.name === "Makefile")) return root;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(root, entry.name);
    if (fs.existsSync(path.join(candidate, "Makefile"))) return candidate;
  }

  throw new Error(`Could not find pgn-extract Makefile under ${root}`);
}

function resolveBinary(): string {
  const extension = process.platform === "win32" ? ".exe" : "";
  const sidecarDirectory = "src-tauri/bin";
  const sidecarBinaries = fs.existsSync(sidecarDirectory)
    ? fs
        .readdirSync(sidecarDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.startsWith("pgn-extract-"))
        .map((entry) => path.resolve(sidecarDirectory, entry.name))
    : [];
  const candidates = [path.resolve(`external/pgn-extract${extension}`), ...sidecarBinaries];

  const binary = candidates.find((candidate) => fs.existsSync(candidate));
  if (!binary) {
    throw new Error("pgn-extract binary not found. Run bun run scripts/downloadPgnExtract.ts first.");
  }

  return binary;
}

function resolveTestDirectory(): string {
  const sourceRoot = "external/pgn-extract-src";
  if (!fs.existsSync(sourceRoot)) {
    throw new Error("pgn-extract source not found. Run bun run scripts/downloadPgnExtract.ts first.");
  }

  const makefileDirectory = findMakefileDirectory(sourceRoot);
  const testDirectory = path.join(makefileDirectory, "test");
  if (!fs.existsSync(path.join(testDirectory, "Makefile"))) {
    throw new Error(`Official pgn-extract tests were not found in ${testDirectory}`);
  }

  return testDirectory;
}

function main(): void {
  const binary = resolveBinary();
  const testDirectory = resolveTestDirectory();
  console.log(`Running official pgn-extract tests with ${binary}`);
  execSync(`make PGN_EXTRACT=${JSON.stringify(binary)} ${OFFICIAL_TEST_TARGETS.join(" ")}`, {
    cwd: testDirectory,
    stdio: "inherit",
  });
  console.log("Official pgn-extract repair/normalize tests passed");
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
