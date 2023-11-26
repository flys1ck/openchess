import { describe, expect, it } from "vitest";
import { getMoveStringFromSan } from "./moves";

describe("getMoveStringFromSan", () => {
  it("should return empty string when no moves are provided", () => {
    expect(getMoveStringFromSan([])).toBe("");
  });

  it("should format for white's turn", () => {
    expect(getMoveStringFromSan(["e4", "e5", "Nf3"], "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toBe(
      "1.e4 e5 2.Nf3"
    );
  });

  it.skip("should format for black's turn", () => {
    expect(
      getMoveStringFromSan(
        ["e4", "e5", "Nf3", "Nc6"],
        "rnbqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2"
      )
    ).toBe("2 ... Nc6");
  });

  it("should format for long input", () => {
    const moves = [
      "Nf3",
      "d5",
      "d4",
      "Nf6",
      "Bf4",
      "e6",
      "e3",
      "c5",
      "c3",
      "Qb6",
      "b3",
      "cxd4",
      "cxd4",
      "Nc6",
      "Be2",
      "Bb4+",
      "Nbd2",
      "Bd7",
      "O-O",
      "O-O",
      "Bg5",
      "Be7",
      "Ne5",
      "Rfe8",
      "Bxf6",
      "Nxe5",
      "Bxe5",
      "Bd6",
      "Nf3",
      "Rac8",
      "Qd2",
      "a6",
      "Rac1",
      "Bb5",
      "Bxb5",
      "axb5",
      "Rxc8",
      "Rxc8",
      "Rc1",
      "Rxc1+",
      "Qxc1",
      "h6",
      "Qc8+",
      "Bf8",
      "h3",
      "Qa6",
      "Qc2",
      "b4",
      "Bh2",
      "b5",
      "Ne5",
      "Qb7",
      "Nc6",
      "Kh8",
      "Nd8",
      "Qd7",
      "Qc7",
      "Qe8",
      "Nxf7+",
      "Kg8",
      "Nd6",
      "Qg6",
      "Be5",
    ];
    expect(getMoveStringFromSan(moves)).toBe(
      "1.Nf3 d5 2.d4 Nf6 3.Bf4 e6 4.e3 c5 5.c3 Qb6 6.b3 cxd4 7.cxd4 Nc6 8.Be2 Bb4+ 9.Nbd2 Bd7 10.O-O O-O 11.Bg5 Be7 12.Ne5 Rfe8 13.Bxf6 Nxe5 14.Bxe5 Bd6 15.Nf3 Rac8 16.Qd2 a6 17.Rac1 Bb5 18.Bxb5 axb5 19.Rxc8 Rxc8 20.Rc1 Rxc1+ 21.Qxc1 h6 22.Qc8+ Bf8 23.h3 Qa6 24.Qc2 b4 25.Bh2 b5 26.Ne5 Qb7 27.Nc6 Kh8 28.Nd8 Qd7 29.Qc7 Qe8 30.Nxf7+ Kg8 31.Nd6 Qg6 32.Be5"
    );
  });

  it("should throw error when invalid FEN is provided", () => {
    expect(() => getMoveStringFromSan(["e4", "e5", "Nf3"], "invalid FEN")).toThrowError();
  });
});
