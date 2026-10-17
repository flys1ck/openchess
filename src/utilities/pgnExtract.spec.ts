import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PGN_EXTRACT_REPAIR_FLAGS,
  PGN_EXTRACT_SIDECAR,
  PgnExtractError,
  repairPgn,
  selectRepairedPgn,
} from "./pgnExtract";

const joinMock = vi.fn<(...paths: string[]) => Promise<string>>();
const tempDirMock = vi.fn<() => Promise<string>>();
const removeMock = vi.fn<(path: string) => Promise<void>>();
const writeTextFileMock = vi.fn<(path: string, contents: string) => Promise<void>>();
const sidecarMock = vi.fn<(program: string, args?: string | string[]) => { execute: () => Promise<unknown> }>();

vi.mock("@tauri-apps/api/path", () => ({
  join: (...args: string[]) => joinMock(...args),
  tempDir: () => tempDirMock(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  remove: (path: string) => removeMock(path),
  writeTextFile: (path: string, contents: string) => writeTextFileMock(path, contents),
}));

vi.mock("@tauri-apps/plugin-shell", () => ({
  Command: {
    sidecar: (program: string, args?: string | string[]) => sidecarMock(program, args),
  },
}));

describe("PGN_EXTRACT_REPAIR_FLAGS", () => {
  it("uses the documented repair preset in capability order", () => {
    expect(PGN_EXTRACT_SIDECAR).toBe("bin/pgn-extract");
    expect(PGN_EXTRACT_REPAIR_FLAGS).toEqual([
      "--quiet",
      "--keepbroken",
      "--fixtagstrings",
      "--fixresulttags",
      "--nestedcomments",
      "--lichesscommentfix",
      "--addfencastling",
      "--allownullmoves",
    ]);
  });
});

describe("selectRepairedPgn", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns rewritten PGN when the sidecar produced games", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const pgn = '[Result "1-0"]\n\n1. f3 e5 2. g4 Qh4# 1-0\n';

    expect(selectRepairedPgn(pgn, "illegal move in game 2")).toBe(pgn);
    expect(warn).toHaveBeenCalledWith("illegal move in game 2");
  });

  it("keeps silent when there are no diagnostics", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(selectRepairedPgn("1. e4 e5 1-0\n")).toBe("1. e4 e5 1-0\n");
    expect(warn).not.toHaveBeenCalled();
  });

  it("throws when keepbroken still produced no games", () => {
    expect(() => selectRepairedPgn("   ", "syntax error")).toThrow(PgnExtractError);
    expect(() => selectRepairedPgn("", "syntax error")).toThrowError(/produced no games/);
  });
});

describe("repairPgn", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("writes the upload to a temp file and runs the sidecar with the repair flags", async () => {
    const execute = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      code: 0,
      stdout: "1. e4 e5 1-0\n",
      stderr: "illegal move in variation",
    });
    tempDirMock.mockResolvedValue("/tmp");
    joinMock.mockResolvedValue("/tmp/pgn-extract-input.pgn");
    writeTextFileMock.mockResolvedValue();
    removeMock.mockResolvedValue();
    sidecarMock.mockReturnValue({ execute });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(repairPgn("e4 e5 1-0")).resolves.toBe("1. e4 e5 1-0\n");

    expect(writeTextFileMock).toHaveBeenCalledWith("/tmp/pgn-extract-input.pgn", "e4 e5 1-0");
    expect(sidecarMock).toHaveBeenCalledWith(PGN_EXTRACT_SIDECAR, [
      ...PGN_EXTRACT_REPAIR_FLAGS,
      "/tmp/pgn-extract-input.pgn",
    ]);
    expect(removeMock).toHaveBeenCalledWith("/tmp/pgn-extract-input.pgn");
    expect(warn).toHaveBeenCalledWith("illegal move in variation");
  });

  it("removes the temp file when the sidecar fails", async () => {
    tempDirMock.mockResolvedValue("/tmp");
    joinMock.mockResolvedValue("/tmp/pgn-extract-input.pgn");
    writeTextFileMock.mockResolvedValue();
    removeMock.mockResolvedValue();
    sidecarMock.mockReturnValue({
      execute: vi.fn<() => Promise<unknown>>().mockRejectedValue(new Error("spawn failed")),
    });

    await expect(repairPgn("e4 e5 1-0")).rejects.toThrow("spawn failed");
    expect(removeMock).toHaveBeenCalledWith("/tmp/pgn-extract-input.pgn");
  });
});
