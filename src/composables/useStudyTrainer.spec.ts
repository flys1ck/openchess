import { describe, expect, it } from "vitest";
import {
  countStudentMoves,
  countStudentMovesPlayed,
  isExpectedMove,
  shouldAutoPlayMove,
  TrainerNode,
} from "../utilities/studyTrainer";

describe("isExpectedMove", () => {
  it("matches source and destination", () => {
    expect(isExpectedMove({ source: "e2", destination: "e4" }, "e2", "e4")).toBe(true);
    expect(isExpectedMove({ source: "e2", destination: "e4" }, "e2", "e3")).toBe(false);
    expect(isExpectedMove({ source: "e2", destination: "e4" }, "d2", "d4")).toBe(false);
  });

  it("treats king UCI castle dests as the king destination", () => {
    expect(isExpectedMove({ source: "e1", destination: "g1" }, "e1", "h1", "king")).toBe(true);
    expect(isExpectedMove({ source: "e1", destination: "c1" }, "e1", "a1", "king")).toBe(true);
    expect(isExpectedMove({ source: "e8", destination: "g8" }, "e8", "h8", "king")).toBe(true);
    expect(isExpectedMove({ source: "e8", destination: "c8" }, "e8", "a8", "king")).toBe(true);
  });

  it("does not remap castle dests for non-king pieces", () => {
    expect(isExpectedMove({ source: "e1", destination: "g1" }, "e1", "h1", "pawn")).toBe(false);
  });
});

describe("shouldAutoPlayMove", () => {
  it("auto-plays opponent moves and null moves", () => {
    const whitePawn: TrainerNode = {
      ply: 1,
      move: { source: "e2", destination: "e4", san: "e4", piece: { color: "white" } },
    };
    const blackPawn: TrainerNode = {
      ply: 2,
      move: { source: "e7", destination: "e5", san: "e5", piece: { color: "black" } },
    };
    const nullMove: TrainerNode = {
      ply: 1,
      move: { source: "e2", destination: "e4", san: "--", piece: { color: "white" } },
    };
    expect(shouldAutoPlayMove(whitePawn, "black")).toBe(true);
    expect(shouldAutoPlayMove(blackPawn, "white")).toBe(true);
    expect(shouldAutoPlayMove(nullMove, "white")).toBe(true);
  });

  it("does not auto-play the student move", () => {
    const studentMove: TrainerNode = {
      ply: 2,
      move: { source: "c7", destination: "c6", san: "c6", piece: { color: "black" } },
    };
    expect(shouldAutoPlayMove(studentMove, "black")).toBe(false);
    expect(shouldAutoPlayMove(undefined, "white")).toBe(false);
  });

  it("uses ply when piece color is wrong", () => {
    const blackMoveWithWhitePiece: TrainerNode = {
      ply: 2,
      move: { source: "c7", destination: "c6", san: "c6", piece: { color: "white" } },
    };
    expect(shouldAutoPlayMove(blackMoveWithWhitePiece, "black")).toBe(false);
    expect(shouldAutoPlayMove(blackMoveWithWhitePiece, "white")).toBe(true);
  });
});

describe("countStudentMoves", () => {
  const e4: TrainerNode = {
    ply: 1,
    move: { source: "e2", destination: "e4", san: "e4", piece: { color: "white" } },
  };
  const c6: TrainerNode = {
    ply: 2,
    move: { source: "c7", destination: "c6", san: "c6", piece: { color: "black" } },
  };
  const d4: TrainerNode = {
    ply: 3,
    move: { source: "d2", destination: "d4", san: "d4", piece: { color: "white" } },
  };
  const root: TrainerNode = { ply: 0, nextPosition: e4 };
  e4.previousPosition = root;
  e4.nextPosition = c6;
  c6.previousPosition = e4;
  c6.nextPosition = d4;
  d4.previousPosition = c6;

  it("counts student moves on the mainline", () => {
    expect(countStudentMoves(root, "black")).toBe(1);
    expect(countStudentMoves(root, "white")).toBe(2);
  });

  it("counts student moves played up to the active node", () => {
    expect(countStudentMovesPlayed(root, "black")).toBe(0);
    expect(countStudentMovesPlayed(e4, "black")).toBe(0);
    expect(countStudentMovesPlayed(c6, "black")).toBe(1);
    expect(countStudentMovesPlayed(d4, "white")).toBe(2);
  });
});
