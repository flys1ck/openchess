import { INITIAL_FEN } from "chessops/fen";
import { describe, expect, it } from "vitest";
import { formatSanMoves, getLinePreviews, getStartPly } from "./linePreview";

describe("formatSanMoves", () => {
  it("numbers moves from the initial position", () => {
    expect(formatSanMoves(["e4", "c6", "d4", "d5"])).toBe("1.e4 c6 2.d4 d5");
  });

  it("starts with an ellipsis number when black moves first", () => {
    expect(formatSanMoves(["Nc6", "c3", "Nf6"], 7)).toBe("4...Nc6 5.c3 Nf6");
  });

  it("returns an empty string without moves", () => {
    expect(formatSanMoves([])).toBe("");
  });
});

describe("getStartPly", () => {
  it("counts plies before the side to move", () => {
    expect(getStartPly(INITIAL_FEN)).toBe(0);
    expect(getStartPly("1k2r3/pp3p2/2p2n1b/5Q2/P5nP/2NR4/1P2PPBq/1R3K2 b - - 0 24")).toBe(47);
    expect(getStartPly("r2q1rk1/pp1nbppp/2p1pn2/5b2/2QP4/5NP1/PP2PPBP/RNBR2K1 w - - 0 10")).toBe(18);
  });
});

describe("getLinePreviews", () => {
  it("leaves out the moves all lines share", () => {
    const previews = getLinePreviews([
      { moves: " e4 c6 d4 d5 exd5 cxd5 Bd3 Nf6 c3" },
      { moves: " e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3" },
      { moves: " e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6" },
    ]);
    expect(previews).toEqual(["4.Bd3 Nf6 5.c3", "4.Bd3 Nc6 5.c3", "4.Nf3 Nc6"]);
  });

  it("shows nothing for a line that only plays the shared moves", () => {
    expect(getLinePreviews([{ moves: "e4 c6" }, { moves: "e4 c6 d4 d5" }])).toEqual(["", "2.d4 d5"]);
    expect(getLinePreviews([{ moves: "e4 c6" }, { moves: "e4 c6" }])).toEqual(["", ""]);
  });

  it("shows a single line in full", () => {
    expect(getLinePreviews([{ moves: "e4 c6 d4" }])).toEqual(["1.e4 c6 2.d4"]);
  });

  it("numbers lines from their own start position and leaves them out of the shared moves", () => {
    const previews = getLinePreviews([
      { moves: "e4 c6 d4 d5" },
      { moves: "e4 c6 Nc3 d5", startFen: INITIAL_FEN },
      { moves: "Rg8 Qf3", startFen: "1k2r3/pp3p2/2p2n1b/5Q2/P5nP/2NR4/1P2PPBq/1R3K2 b - - 0 24" },
      { moves: "" },
    ]);
    expect(previews).toEqual(["2.d4 d5", "2.Nc3 d5", "24...Rg8 25.Qf3", ""]);
  });
});
