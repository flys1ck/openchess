import { describe, expect, it } from "vitest";
import { getPositionKey, getPossibleMoves, isEnPassant, isPromotion } from "./move";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("isEnPassant", () => {
  it("should be true for a diagonal pawn move", () => {
    expect(isEnPassant("e5", "d6", "pawn")).toBe(true);
    expect(isEnPassant("e4", "f5", "pawn")).toBe(true);
  });

  it("should be false for a straight pawn push", () => {
    expect(isEnPassant("e2", "e4", "pawn")).toBe(false);
    expect(isEnPassant("e7", "e6", "pawn")).toBe(false);
  });

  it("should be false when the moving piece is not a pawn", () => {
    expect(isEnPassant("e5", "d6", "queen")).toBe(false);
    expect(isEnPassant("e5", "d6", undefined)).toBe(false);
  });
});

describe("isPromotion", () => {
  it("should be true when a pawn reaches the last rank", () => {
    expect(isPromotion("e8", "pawn")).toBe(true);
    expect(isPromotion("a1", "pawn")).toBe(true);
  });

  it("should be false when a pawn is not on the last rank", () => {
    expect(isPromotion("e7", "pawn")).toBe(false);
    expect(isPromotion("e4", "pawn")).toBe(false);
  });

  it("should be false when the piece is not a pawn", () => {
    expect(isPromotion("e8", "queen")).toBe(false);
    expect(isPromotion("a1", "rook")).toBe(false);
    expect(isPromotion("e8", undefined)).toBe(false);
  });
});

describe("getPositionKey", () => {
  it("should return the first four FEN fields", () => {
    expect(getPositionKey(START_FEN)).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
    expect(getPositionKey("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")).toBe(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3"
    );
  });

  it("should trim surrounding whitespace and collapse field separators", () => {
    expect(getPositionKey(`  ${START_FEN}  `)).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
    expect(getPositionKey("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR  w   KQkq  -  0  1")).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"
    );
  });

  it("should throw when the FEN does not have six fields", () => {
    expect(() => getPositionKey("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -")).toThrow(
      "Expected a complete FEN"
    );
    expect(() => getPositionKey("not a fen")).toThrow("Expected a complete FEN");
    expect(() => getPositionKey(`${START_FEN} extra`)).toThrow("Expected a complete FEN");
  });
});

describe("getPossibleMoves", () => {
  it("should return chessground dests for the starting position", () => {
    const dests = getPossibleMoves(START_FEN);

    expect(dests.get("e2")).toEqual(["e3", "e4"]);
    expect(dests.get("b1")).toEqual(["a3", "c3"]);
    expect(dests.get("a1")).toBeUndefined();
    expect(dests.size).toBe(10);
  });

  it("should include an en passant capture among pawn dests", () => {
    const dests = getPossibleMoves("rnbqkbnr/ppp2ppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3");

    expect(dests.get("e5")).toEqual(["d6", "e6"]);
  });

  it("should return no dests in checkmate", () => {
    const dests = getPossibleMoves("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");

    expect(dests.size).toBe(0);
  });

  it("should throw when the FEN cannot be parsed", () => {
    expect(() => getPossibleMoves("not a fen")).toThrow("ERR_TURN");
  });
});
