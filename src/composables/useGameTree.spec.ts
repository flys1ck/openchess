import { beforeAll, describe, expect, it } from "vitest";
import { ChessMove, useGameTree } from "./useGameTree";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4_FEN = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
const AFTER_E5_FEN = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";
const AFTER_NF3_FEN = "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";
const AFTER_C5_FEN = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

beforeAll(() => {
  Object.defineProperty(globalThis, "window", {
    value: { crypto: globalThis.crypto },
    configurable: true,
  });
});

function chessMove(overrides: Partial<ChessMove> & Pick<ChessMove, "san" | "source" | "destination">): ChessMove {
  return {
    isCheck: false,
    isCapture: false,
    piece: { role: "pawn", color: "white" },
    ...overrides,
  };
}

describe("useGameTree", () => {
  describe("addNode", () => {
    it("should create a root node and set it active", () => {
      const tree = useGameTree();
      const root = tree.addNode(START_FEN);

      expect(tree.root.value?.id).toBe(root.id);
      expect(tree.activeNode.value?.id).toBe(root.id);
      expect(root.fen).toBe(START_FEN);
      expect(root.ply).toBe(0);
      expect(root.variations).toEqual([]);
      expect(root.move).toBeUndefined();
    });

    it("should append a mainline child from the active node", () => {
      const tree = useGameTree();
      const root = tree.addNode(START_FEN);
      const e4 = tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4" }),
      });

      expect(e4.previousPosition?.id).toBe(root.id);
      expect(tree.root.value?.nextPosition?.id).toBe(e4.id);
      expect(e4.ply).toBe(1);
      expect(tree.activeNode.value?.id).toBe(e4.id);
    });

    it("should store extra moves as variations", () => {
      const tree = useGameTree();
      tree.addNode(START_FEN);
      const e4 = tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4" }),
      });
      tree.setActiveNode(e4.previousPosition!);
      const d4 = tree.addNode("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1", {
        move: chessMove({ source: "d2", destination: "d4", san: "d4" }),
      });

      expect(e4.previousPosition?.nextPosition?.id).toBe(e4.id);
      expect(e4.previousPosition?.variations.map((variation) => variation.id)).toEqual([d4.id]);
      expect(tree.activeNode.value?.id).toBe(d4.id);
    });

    it("should reuse an existing mainline move instead of duplicating it", () => {
      const tree = useGameTree();
      tree.addNode(START_FEN);
      const e4 = tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4" }),
      });
      tree.setActiveNode(e4.previousPosition!);
      const again = tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4" }),
      });

      expect(tree.activeNode.value?.id).toBe(e4.id);
      expect(e4.previousPosition?.nextPosition?.id).toBe(e4.id);
      expect(e4.previousPosition?.variations).toEqual([]);
      expect(again.id).not.toBe(e4.id);
    });
  });

  describe("fromPgn", () => {
    it("should import a mainline and reset the cursor to the root", () => {
      const tree = useGameTree();
      tree.fromPgn("1. e4 e5 2. Nf3 *");

      const root = tree.root.value;
      expect(root?.fen).toBe(START_FEN);
      expect(tree.activeNode.value?.id).toBe(root?.id);
      expect(root?.nextPosition?.move?.san).toBe("e4");
      expect(root?.nextPosition?.nextPosition?.move?.san).toBe("e5");
      expect(root?.nextPosition?.nextPosition?.nextPosition?.move?.san).toBe("Nf3");
      expect(root?.nextPosition?.nextPosition?.nextPosition?.nextPosition).toBeUndefined();
    });

    it("should import variations off the mainline", () => {
      const tree = useGameTree();
      tree.fromPgn("1. e4 e5 (1... c5) 2. Nf3 *");

      const e4 = tree.root.value?.nextPosition;
      expect(e4?.move?.san).toBe("e4");
      expect(e4?.nextPosition?.move?.san).toBe("e5");
      expect(e4?.variations).toHaveLength(1);
      expect(e4?.variations[0]?.move?.san).toBe("c5");
      expect(e4?.variations[0]?.fen).toBe(AFTER_C5_FEN);
      expect(e4?.nextPosition?.nextPosition?.move?.san).toBe("Nf3");
      expect(e4?.nextPosition?.nextPosition?.fen).toBe(AFTER_NF3_FEN);
    });

    it("should store comments on imported nodes", () => {
      const tree = useGameTree();
      tree.fromPgn("1. e4 {best by test} e5 *");

      expect(tree.root.value?.nextPosition?.comment).toBe("best by test");
    });

    it("should ignore an empty PGN", () => {
      const tree = useGameTree();
      tree.fromPgn("");

      expect(tree.root.value).toBeUndefined();
      expect(tree.activeNode.value).toBeUndefined();
    });
  });

  describe("pgn export", () => {
    it("should export the mainline using ply as the white move number", () => {
      const tree = useGameTree();
      tree.addNode(START_FEN);
      tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4", piece: { role: "pawn", color: "white" } }),
      });
      tree.addNode(AFTER_E5_FEN, {
        move: chessMove({ source: "e7", destination: "e5", san: "e5", piece: { role: "pawn", color: "black" } }),
      });
      tree.addNode(AFTER_NF3_FEN, {
        move: chessMove({
          source: "g1",
          destination: "f3",
          san: "Nf3",
          piece: { role: "knight", color: "white" },
        }),
      });

      expect(tree.pgn.value).toBe("1. e4 e5 3. Nf3 ");
    });

    it("should include comments and omit checkmate markers and annotations", () => {
      const tree = useGameTree();
      tree.addNode(START_FEN);
      tree.addNode(AFTER_E4_FEN, {
        move: chessMove({
          source: "e2",
          destination: "e4",
          san: "e4",
          piece: { role: "pawn", color: "white" },
          annotations: [1],
        }),
        comment: "best by test",
      });
      tree.addNode("rnbqkbnr/pppp1Qpp/8/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 2", {
        move: chessMove({
          source: "d1",
          destination: "f7",
          san: "Qxf7",
          piece: { role: "queen", color: "white" },
          isCapture: true,
          isCheck: true,
        }),
      });

      expect(tree.pgn.value).toBe("1. e4 {best by test} 2. Qxf7 ");
      expect(tree.pgn.value).not.toContain("#");
      expect(tree.pgn.value).not.toContain("!");
      expect(tree.pgn.value).not.toContain("$1");
    });

    it("should not export variations", () => {
      const tree = useGameTree();
      tree.addNode(START_FEN);
      const e4 = tree.addNode(AFTER_E4_FEN, {
        move: chessMove({ source: "e2", destination: "e4", san: "e4" }),
      });
      tree.setActiveNode(e4.previousPosition!);
      tree.addNode("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1", {
        move: chessMove({ source: "d2", destination: "d4", san: "d4" }),
      });

      expect(tree.pgn.value).toBe("1. e4 ");
      expect(tree.pgn.value).not.toContain("d4");
    });

    it("should return an empty string when there are no moves", () => {
      const tree = useGameTree();
      expect(tree.pgn.value).toBe("");
      tree.addNode(START_FEN);
      expect(tree.pgn.value).toBe("");
    });
  });
});
