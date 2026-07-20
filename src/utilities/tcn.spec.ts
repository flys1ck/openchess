import { describe, expect, it } from "vitest";
import { decodeTcn, tcnToPgn } from "./tcn";

describe("decodeTcn", () => {
  it("should decode the opening of a Slav Defense", () => {
    const moves = decodeTcn("lBYQkAZJgv!T");

    expect(moves).toEqual([
      { from: 11, to: 27 }, // d2d4
      { from: 50, to: 42 }, // c7c6
      { from: 10, to: 26 }, // c2c4
      { from: 51, to: 35 }, // d7d5
      { from: 6, to: 21 }, // g1f3
      { from: 62, to: 45 }, // g8f6
    ]);
  });
});

describe("tcnToPgn", () => {
  it("should produce SAN moves matching the decoded opening", () => {
    const pgn = tcnToPgn("lBYQkAZJgv!T", {
      Event: "Live Chess",
      White: "KevinTheSnipe",
      Black: "Pguttah3000",
      Result: "0-1",
    });

    expect(pgn).toContain('[White "KevinTheSnipe"]');
    expect(pgn).toContain('[Black "Pguttah3000"]');
    expect(pgn).toContain("1. d4 c6 2. c4 d5 3. Nf3 Nf6");
  });
});
