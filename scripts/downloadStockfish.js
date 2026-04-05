/* oxlint-disable no-console */
import cpuFeatures from "cpu-features";
import fd from "follow-redirects";
import fs from "fs";
import tar from "tar";
import unzipper from "unzipper";

function getPlatform() {
  const platform = process.platform;
  if (platform === "win32") {
    return "windows";
  }
  if (platform === "darwin") {
    return "macos";
  }
  if (platform === "linux") {
    return "ubuntu";
  }
  throw new Error(`Unsupported platform: ${platform}`);
}

function getCpuArchitecture() {
  const platform = process.platform;
  if (platform === "darwin") {
    if (process.arch === "arm64") {
      return "m1";
    } else if (process.arch === "x64") {
      return "x86-64";
    }
  }
}

function getCpuExtension(features) {
  const platform = process.platform;
  if (features.flags.avx2 && platform !== "darwin") {
    return "avx2";
  }
  return "apple-silicon";
}

const STOCKFISH_VERSION = process.env.STOCKFISH_VERSION;

const CPU_FEATURES = cpuFeatures();
const PLATFORM = getPlatform();
const CPU_ARCHITECTURE = getCpuArchitecture(CPU_FEATURES);
const CPU_EXTENSION = getCpuExtension(CPU_FEATURES);

const STOCKFISH_ARCHIVE_EXTENSION = PLATFORM === "windows" ? ".zip" : ".tar";
const STOCKFISH_FILE_EXTENSION = PLATFORM === "windows" ? ".exe" : "";
const STOCKFISH_FILENAME = `stockfish-${PLATFORM}-${CPU_ARCHITECTURE}-${CPU_EXTENSION}`;
const STOCKFISH_DOWNLOAD_BASE_URL = `https://github.com/official-stockfish/Stockfish/releases/download/sf_${STOCKFISH_VERSION}`;
const STOCKFISH_DOWNLOAD_URL = `${STOCKFISH_DOWNLOAD_BASE_URL}/${STOCKFISH_FILENAME}${STOCKFISH_ARCHIVE_EXTENSION}`;
const STOCKFISH_DOWNLOAD_PATH = `external/stockfish${STOCKFISH_ARCHIVE_EXTENSION}`;
const STOCKFISH_BINARY_PATH = `external/stockfish${STOCKFISH_FILE_EXTENSION}`;

const stockfishBinaryFilter = (path) => path.includes(`${STOCKFISH_FILENAME}${STOCKFISH_FILE_EXTENSION}`);

function renameAndCleanup() {
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

function parseArchive(readStream) {
  if (STOCKFISH_ARCHIVE_EXTENSION === ".zip") {
    console.log("Extracting zip archive");
    readStream.pipe(unzipper.Parse()).on("entry", (entry) => {
      if (stockfishBinaryFilter(entry.path)) {
        entry.pipe(
          fs.createWriteStream(`external/stockfish${STOCKFISH_FILE_EXTENSION}`).on("finish", renameAndCleanup)
        );
      } else {
        entry.autodrain();
      }
    });
  } else if (STOCKFISH_ARCHIVE_EXTENSION === ".tar") {
    console.log("Extracting tar archive");
    readStream
      .pipe(
        tar.x({
          cwd: "external",
          filter: stockfishBinaryFilter,
        })
      )
      .on("error", (error) => {
        if (error) throw error;
      })
      .on("finish", () => {
        console.log("Finished extracting tar archive");
        renameAndCleanup();
      });
  }
}

async function main() {
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

  request.on("error", (error) => {
    fs.unlink(STOCKFISH_DOWNLOAD_PATH);
    if (error) throw error;
  });
  writeStream.on("finish", function () {
    console.log("Finished downloading");
    writeStream.close();

    const readStream = fs.createReadStream(STOCKFISH_DOWNLOAD_PATH);
    parseArchive(readStream);
  });
}

main().catch((error) => {
  console.error(error);
});
