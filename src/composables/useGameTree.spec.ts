import { describe, expect, it } from "vitest";
import { useGameTree } from "./useGameTree";

describe("useGameTree", () => {
  it("numbers moves from the FEN of a custom starting position", () => {
    const tree = useGameTree();
    tree.fromPgn(
      '[SetUp "1"]\n[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"]\n\n2... Nc6 3. Bb5 *'
    );

    const root = tree.root.value!;
    const first = root.nextPosition!;
    const second = first.nextPosition!;
    expect(root.ply).toBe(3);
    expect([first.ply, first.move?.piece.color]).toEqual([4, "black"]);
    expect([second.ply, second.move?.piece.color]).toEqual([5, "white"]);
  });
});
