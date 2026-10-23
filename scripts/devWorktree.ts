/* oxlint-disable no-console */
import { Database } from "bun:sqlite";
import { execFileSync, spawn } from "child_process";
import {
  constants,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "fs";
import { connect } from "net";
import { homedir } from "os";
import { basename, dirname, join } from "path";

const BASE_IDENTIFIER = "com.openchess.dev";
const FIRST_WORKTREE_PORT = 1421;
const WORKTREE_PORT_COUNT = 79;
const SIDECAR_DIRECTORY = "src-tauri/bin";
const DATABASE_FILENAME = "db.sqlite";

const git = (...args: string[]) => execFileSync("git", args).toString().trim();

// The folders Tauri creates per app identifier. The first one is the app config dir that holds the database.
function appDirectoryRoots(): string[] {
  const home = homedir();
  if (process.platform === "darwin")
    return [join(home, "Library", "Application Support"), join(home, "Library", "Caches")];
  if (process.platform === "win32")
    return [
      process.env.APPDATA ?? join(home, "AppData", "Roaming"),
      process.env.LOCALAPPDATA ?? join(home, "AppData", "Local"),
    ];
  return [
    process.env.XDG_CONFIG_HOME ?? join(home, ".config"),
    process.env.XDG_DATA_HOME ?? join(home, ".local", "share"),
    process.env.XDG_CACHE_HOME ?? join(home, ".cache"),
  ];
}

function appConfigDirectory(identifier: string): string {
  return join(appDirectoryRoots()[0], identifier);
}

function worktreeSlug(worktreePath: string): string {
  return basename(worktreePath)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 40);
}

function removeDataOfDeletedWorktrees(): void {
  const prefix = `${BASE_IDENTIFIER}.`;
  const worktreeSlugs = new Set(
    git("worktree", "list", "--porcelain")
      .split("\n")
      .filter((line) => line.startsWith("worktree "))
      .map((line) => worktreeSlug(line.slice("worktree ".length)))
  );

  for (const root of appDirectoryRoots()) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) {
      if (!entry.startsWith(prefix) || worktreeSlugs.has(entry.slice(prefix.length))) continue;
      rmSync(join(root, entry), { recursive: true, force: true });
      console.log(`Removed ${join(root, entry)}, its worktree no longer exists`);
    }
  }
}

async function isPortInUse(port: number): Promise<boolean> {
  const probes = ["127.0.0.1", "::1"].map(
    (host) =>
      new Promise<boolean>((resolve) => {
        const socket = connect({ host, port });
        socket.once("connect", () => {
          socket.destroy();
          resolve(true);
        });
        socket.once("error", () => resolve(false));
      })
  );
  return (await Promise.all(probes)).some(Boolean);
}

// Starts from a port derived from the worktree name so each worktree usually keeps its port.
// The port is part of the Tauri config, and a changed config recompiles the app crate.
async function findDevPort(slug: string): Promise<number> {
  const offset = slug
    .split("")
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % WORKTREE_PORT_COUNT, 0);
  for (let attempt = 0; attempt < WORKTREE_PORT_COUNT; attempt++) {
    const port = FIRST_WORKTREE_PORT + ((offset + attempt) % WORKTREE_PORT_COUNT);
    if (!(await isPortInUse(port))) return port;
  }
  throw new Error(
    `No free dev port between ${FIRST_WORKTREE_PORT} and ${FIRST_WORKTREE_PORT + WORKTREE_PORT_COUNT - 1}`
  );
}

function seedDatabase(identifier: string): void {
  const source = join(appConfigDirectory(BASE_IDENTIFIER), DATABASE_FILENAME);
  const targetDirectory = appConfigDirectory(identifier);
  const target = join(targetDirectory, DATABASE_FILENAME);
  if (existsSync(target)) {
    console.log(`Using worktree database ${target} (delete it to copy the main database again)`);
    return;
  }
  if (!existsSync(source)) {
    console.log(`No main database at ${source}, the app starts with an empty one`);
    return;
  }

  mkdirSync(targetDirectory, { recursive: true });
  // VACUUM INTO takes a consistent snapshot even while the main app has the database open in WAL mode.
  const database = new Database(source, { readonly: true });
  database.run("VACUUM INTO ?", [target]);
  database.close();
  console.log(`Copied main database to ${target}`);
}

function copySidecars(mainCheckout: string): void {
  const source = join(mainCheckout, SIDECAR_DIRECTORY);
  if (existsSync(SIDECAR_DIRECTORY)) return;
  if (!existsSync(source)) {
    console.warn(`No ${SIDECAR_DIRECTORY} in ${mainCheckout}, see README for downloading Stockfish`);
    return;
  }

  cpSync(source, SIDECAR_DIRECTORY, { recursive: true });
  console.log(`Copied ${SIDECAR_DIRECTORY} from ${mainCheckout}`);
}

// tauri-build copies sidecars next to Cargo's build dir, not the target dir. With a shared build dir
// they would be missing next to the worktree's binary, where the shell plugin looks for them.
function placeSidecarsNextToBinary(externalBins: string[]): void {
  const targetTriple = execFileSync("rustc", ["--print", "host-tuple"]).toString().trim();
  const extension = process.platform === "win32" ? ".exe" : "";
  const profileDirectory = join(process.env.CARGO_TARGET_DIR ?? "src-tauri/target", "debug");
  mkdirSync(profileDirectory, { recursive: true });

  for (const externalBin of externalBins) {
    const source = join("src-tauri", `${externalBin}-${targetTriple}${extension}`);
    const target = join(profileDirectory, `${basename(externalBin)}${extension}`);
    if (!existsSync(source)) continue;
    if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) continue;
    copyFileSync(source, target, constants.COPYFILE_FICLONE);
  }
}

async function main(): Promise<void> {
  const tauriArguments = ["tauri", "dev", ...process.argv.slice(2)];
  let environment = process.env;
  removeDataOfDeletedWorktrees();

  const gitDirectory = git("rev-parse", "--path-format=absolute", "--git-dir");
  const commonGitDirectory = git("rev-parse", "--path-format=absolute", "--git-common-dir");
  if (gitDirectory !== commonGitDirectory) {
    const slug = worktreeSlug(git("rev-parse", "--show-toplevel"));
    const identifier = `${BASE_IDENTIFIER}.${slug}`;
    const port = await findDevPort(slug);
    const tauriConfig = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
    const configOverlay = {
      identifier,
      build: { devUrl: `http://localhost:${port}` },
      app: {
        windows: tauriConfig.app.windows.map((window: { title: string }) => ({
          ...window,
          title: `${window.title} (${slug})`,
        })),
      },
    };

    const mainCheckout = dirname(commonGitDirectory);
    // Worktrees share Cargo's intermediate artifacts, so only the openchess crate compiles in a new worktree.
    // The binary still goes to the worktree's own target dir. The main checkout keeps its own build dir
    // so it never waits for the lock a worktree build holds.
    const buildDirectory = process.env.CARGO_BUILD_BUILD_DIR ?? join(mainCheckout, "src-tauri", "target", "worktrees");

    copySidecars(mainCheckout);
    placeSidecarsNextToBinary(tauriConfig.bundle.externalBin);
    seedDatabase(identifier);
    console.log(`Starting ${identifier} on port ${port}, Cargo build dir ${buildDirectory}`);

    tauriArguments.push("--config", JSON.stringify(configOverlay));
    environment = { ...process.env, VITE_PORT: String(port), CARGO_BUILD_BUILD_DIR: buildDirectory };
  }

  const tauri = spawn("bun", tauriArguments, { stdio: "inherit", env: environment });
  tauri.on("exit", (code) => process.exit(code ?? 1));
}

if (import.meta.main) {
  main().catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
}
