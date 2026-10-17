/* oxlint-disable no-console */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import fd from "follow-redirects";
import * as tar from "tar";

const SUPPORTED_TARGET_TRIPLES = [
  "aarch64-apple-darwin",
  "x86_64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "x86_64-pc-windows-msvc",
] as const;

type TargetTriple = (typeof SUPPORTED_TARGET_TRIPLES)[number];

function getHostTargetTriple(): TargetTriple {
  const platform = process.platform;
  if (platform === "darwin" && process.arch === "arm64") return "aarch64-apple-darwin";
  if (platform === "darwin" && process.arch === "x64") return "x86_64-apple-darwin";
  if (platform === "linux" && process.arch === "x64") return "x86_64-unknown-linux-gnu";
  if (platform === "win32" && process.arch === "x64") return "x86_64-pc-windows-msvc";

  throw new Error(`Unsupported host: ${platform}-${process.arch}`);
}

function isSupportedTargetTriple(value: string): value is TargetTriple {
  return SUPPORTED_TARGET_TRIPLES.includes(value as TargetTriple);
}

function downloadFile(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destination);
    const request = fd.https.get(url, (response) => {
      const statusCode = response.statusCode ?? 0;
      if (statusCode >= 400) {
        reject(new Error(`Download failed with status ${statusCode}: ${url}`));
        return;
      }

      console.log(`Downloading from ${url}`);
      response.pipe(writeStream);
    });

    request.on("error", (error) => {
      fs.unlink(destination, () => {});
      reject(error);
    });
    writeStream.on("error", (error) => {
      fs.unlink(destination, () => {});
      reject(error);
    });
    writeStream.on("finish", () => {
      writeStream.close();
      resolve();
    });
  });
}

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

function compileUnixBinary(sourceRoot: string, targetTriple: TargetTriple): string {
  const makefileDirectory = findMakefileDirectory(sourceRoot);
  const makeEnv = { ...process.env };
  if (targetTriple === "x86_64-apple-darwin") {
    makeEnv.CC = "clang -arch x86_64";
    makeEnv.LDFLAGS = "-arch x86_64";
  }

  console.log(`Compiling pgn-extract in ${makefileDirectory}`);
  execSync("make -j", { cwd: makefileDirectory, env: makeEnv, stdio: "inherit" });

  const compiledBinary = path.join(makefileDirectory, "build", "bin", "pgn-extract");
  if (!fs.existsSync(compiledBinary)) {
    throw new Error(`pgn-extract binary was not produced at ${compiledBinary}`);
  }

  return compiledBinary;
}

const PGN_EXTRACT_VERSION = process.env.PGN_EXTRACT_VERSION ?? "26-04";
const TARGET_TRIPLE = process.env.TARGET_TRIPLE ?? getHostTargetTriple();

if (!isSupportedTargetTriple(TARGET_TRIPLE)) {
  throw new Error(`Unsupported target triple: ${TARGET_TRIPLE}`);
}

const IS_WINDOWS_TARGET = TARGET_TRIPLE === "x86_64-pc-windows-msvc";
const PGN_EXTRACT_FILE_EXTENSION = IS_WINDOWS_TARGET ? ".exe" : "";
const PGN_EXTRACT_BINARY_PATH = `external/pgn-extract${PGN_EXTRACT_FILE_EXTENSION}`;
const PGN_EXTRACT_BASE_URL = "https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract";

async function main(): Promise<void> {
  fs.mkdirSync("external", { recursive: true });
  if (fs.existsSync(PGN_EXTRACT_BINARY_PATH)) {
    console.log("Deleting old pgn-extract binary");
    fs.unlinkSync(PGN_EXTRACT_BINARY_PATH);
  }

  if (IS_WINDOWS_TARGET) {
    await downloadFile(`${PGN_EXTRACT_BASE_URL}/pgn-extract.exe`, PGN_EXTRACT_BINARY_PATH);
    console.log(`Installed Windows pgn-extract to ${PGN_EXTRACT_BINARY_PATH}`);
    return;
  }

  const archivePath = "external/pgn-extract-src.tgz";
  const sourceRoot = "external/pgn-extract-src";
  if (fs.existsSync(sourceRoot)) fs.rmSync(sourceRoot, { recursive: true, force: true });
  fs.mkdirSync(sourceRoot, { recursive: true });

  await downloadFile(`${PGN_EXTRACT_BASE_URL}/pgn-extract-${PGN_EXTRACT_VERSION}.tgz`, archivePath);
  console.log("Extracting pgn-extract source");
  await tar.x({ file: archivePath, cwd: sourceRoot });
  fs.unlinkSync(archivePath);

  const compiledBinary = compileUnixBinary(sourceRoot, TARGET_TRIPLE);
  fs.copyFileSync(compiledBinary, PGN_EXTRACT_BINARY_PATH);
  fs.chmodSync(PGN_EXTRACT_BINARY_PATH, 0o755);
  console.log(`Installed pgn-extract to ${PGN_EXTRACT_BINARY_PATH}`);
}

if (import.meta.main) {
  main().catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
}
