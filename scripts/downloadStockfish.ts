/* oxlint-disable no-console */
import fs from "fs";
import fd from "follow-redirects";
import * as tar from "tar";
import unzipper from "unzipper";

function getStockfishAssetName(targetTriple: string): string {
  if (targetTriple === "aarch64-apple-darwin" || targetTriple === "x86_64-apple-darwin") {
    return "stockfish-macos-universal";
  }

  if (targetTriple === "x86_64-unknown-linux-gnu") {
    return "stockfish-linux-x86-64-universal";
  }

  if (targetTriple === "x86_64-pc-windows-msvc") {
    return "stockfish-windows-x86-64-universal";
  }

  throw new Error(`Unsupported target triple: ${targetTriple}`);
}

function getHostTargetTriple(): string {
  const platform = process.platform;
  if (platform === "darwin" && process.arch === "arm64") {
    return "aarch64-apple-darwin";
  }

  if (platform === "darwin" && process.arch === "x64") {
    return "x86_64-apple-darwin";
  }

  if (platform === "linux" && process.arch === "x64") {
    return "x86_64-unknown-linux-gnu";
  }

  if (platform === "win32" && process.arch === "x64") {
    return "x86_64-pc-windows-msvc";
  }

  throw new Error(`Unsupported host: ${platform}-${process.arch}`);
}

const STOCKFISH_VERSION = process.env.STOCKFISH_VERSION;
const TARGET_TRIPLE = process.env.TARGET_TRIPLE ?? getHostTargetTriple();

const IS_WINDOWS_TARGET = TARGET_TRIPLE.endsWith("-windows-msvc");
const STOCKFISH_ARCHIVE_EXTENSION = IS_WINDOWS_TARGET ? ".zip" : ".tar.gz";
const STOCKFISH_FILE_EXTENSION = IS_WINDOWS_TARGET ? ".exe" : "";
const STOCKFISH_FILENAME = getStockfishAssetName(TARGET_TRIPLE);
const STOCKFISH_DOWNLOAD_BASE_URL = `https://github.com/official-stockfish/Stockfish/releases/download/sf_${STOCKFISH_VERSION}`;
const STOCKFISH_DOWNLOAD_URL = `${STOCKFISH_DOWNLOAD_BASE_URL}/${STOCKFISH_FILENAME}${STOCKFISH_ARCHIVE_EXTENSION}`;
const STOCKFISH_DOWNLOAD_PATH = `external/stockfish${STOCKFISH_ARCHIVE_EXTENSION}`;
const STOCKFISH_BINARY_PATH = `external/stockfish${STOCKFISH_FILE_EXTENSION}`;

const stockfishBinaryFilter = (path: string): boolean =>
  path.includes(`${STOCKFISH_FILENAME}${STOCKFISH_FILE_EXTENSION}`);

function renameAndCleanup(): void {
  console.log("Cleaning up");
  if (fs.existsSync("external/stockfish")) {
    const stockfishBinary = fs.readdirSync("external/stockfish")[0];
    fs.copyFileSync(`external/stockfish/${stockfishBinary}`, `external/${stockfishBinary}`);
    fs.rmSync(STOCKFISH_BINARY_PATH, { recursive: true, force: true });
    fs.renameSync(`external/${stockfishBinary}`, `external/stockfish${STOCKFISH_FILE_EXTENSION}`);
  }
  if (fs.existsSync(STOCKFISH_DOWNLOAD_PATH)) {
    fs.unlinkSync(STOCKFISH_DOWNLOAD_PATH);
  }
}

function parseArchive(readStream: fs.ReadStream): void {
  if (STOCKFISH_ARCHIVE_EXTENSION === ".zip") {
    console.log("Extracting zip archive");
    readStream.pipe(unzipper.Parse()).on("entry", (entry: unzipper.Entry) => {
      if (stockfishBinaryFilter(entry.path)) {
        entry.pipe(
          fs.createWriteStream(`external/stockfish${STOCKFISH_FILE_EXTENSION}`).on("finish", renameAndCleanup)
        );
      } else {
        entry.autodrain();
      }
    });
  } else {
    console.log("Extracting tar archive");
    readStream
      .pipe(
        tar.x({
          cwd: "external",
          filter: stockfishBinaryFilter,
        })
      )
      .on("error", (error: Error) => {
        if (error) throw error;
      })
      .on("finish", () => {
        console.log("Finished extracting tar archive");
        renameAndCleanup();
      });
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync("external")) {
    fs.mkdirSync("external");
  }
  if (fs.existsSync(STOCKFISH_BINARY_PATH)) {
    console.log("Deleting old stockfish binary");
    fs.unlinkSync(STOCKFISH_BINARY_PATH);
  }

  const writeStream = fs.createWriteStream(STOCKFISH_DOWNLOAD_PATH);
  const request = fd.https.get(STOCKFISH_DOWNLOAD_URL, (response) => {
    console.log(`Downloading from ${STOCKFISH_DOWNLOAD_URL}`);
    response.pipe(writeStream);
  });

  request.on("error", (error: Error) => {
    fs.unlink(STOCKFISH_DOWNLOAD_PATH, () => {});
    if (error) throw error;
  });
  writeStream.on("finish", function () {
    console.log("Finished downloading");
    writeStream.close();

    const readStream = fs.createReadStream(STOCKFISH_DOWNLOAD_PATH);
    parseArchive(readStream);
  });
}

if (import.meta.main) {
  main().catch((error: Error) => {
    console.error(error);
  });
}
