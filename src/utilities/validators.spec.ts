import { describe, expect, it } from "vitest";
import { isFEN } from "./validators";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const ILLEGAL_CASTLING_FEN = "rnb1QNnr/2k5/8/ppPp1P2/8/7p/PPP1PP1P/RNB1KB1R w KQ - 0 1";

describe("isFEN", () => {
  it("should accept the starting position", () => {
    expect(isFEN(STARTING_FEN)).toBe(true);
  });

  it("should accept a parseable position with illegal castling rights", () => {
    expect(isFEN(ILLEGAL_CASTLING_FEN)).toBe(true);
  });

  it("should reject invalid strings", () => {
    expect(isFEN("not a fen")).toBe(false);
    expect(isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1")).toBe(false);
  });

  it("should reject incomplete FENs", () => {
    expect(isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP")).toBe(false);
    expect(isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1")).toBe(false);
    expect(isFEN("rnbqkbnr/ppppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toBe(false);
  });

  it("should reject an empty string", () => {
    expect(isFEN("")).toBe(false);
  });

  it("should not throw on invalid input", () => {
    expect(() => isFEN("")).not.toThrow();
    expect(() => isFEN("not a fen")).not.toThrow();
    expect(() => isFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP")).not.toThrow();
  });
});
