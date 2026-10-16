import { describe, expect, it } from "vitest";
import { isFEN } from "./validators";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const TODO_FEN = "rnb1QNnr/2k5/8/ppPp1P2/8/7p/PPP1PP1P/RNB1KB1R w KQ - 0 1";

describe("isFEN", () => {
  it("should accept a standard starting position", () => {
    expect(isFEN(START_FEN)).toBe(true);
  });

  it("should accept black to move and an en passant square", () => {
    expect(isFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")).toBe(true);
  });

  it("should accept empty-board and no-castling FENs", () => {
    expect(isFEN("8/8/8/8/8/8/8/8 w - - 0 1")).toBe(true);
    expect(isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1")).toBe(true);
  });

  it("should accept the FEN mentioned in the isFEN TODO", () => {
    expect(isFEN(TODO_FEN)).toBe(true);
  });

  it("should reject empty and malformed strings", () => {
    expect(isFEN("")).toBe(false);
    expect(isFEN("not a fen")).toBe(false);
    expect(isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")).toBe(false);
    expect(isFEN(`${START_FEN} extra`)).toBe(false);
  });

  it("should reject surrounding whitespace", () => {
    expect(isFEN(` ${START_FEN}`)).toBe(false);
    expect(isFEN(`${START_FEN} `)).toBe(false);
    expect(isFEN(`${TODO_FEN}\n`)).toBe(false);
  });
});
