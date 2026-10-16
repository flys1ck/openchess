import { Color, Key } from "chessground/types";
import { fixCastlingDestination } from "./move";

export type TrainerColor = Color;

export interface TrainerMove {
  source: Key;
  destination: Key;
  san: string;
  piece: { color: TrainerColor };
}

export interface TrainerNode {
  ply?: number;
  move?: TrainerMove;
  nextPosition?: TrainerNode;
  previousPosition?: TrainerNode;
}

export function moverColor(node: TrainerNode) {
  if (node.ply !== undefined) return node.ply % 2 === 1 ? "white" : "black";
  return node.move?.piece.color;
}

export function isExpectedMove(
  expected: { source: Key; destination: Key },
  source: Key,
  destination: Key,
  sourcePieceRole?: string | null
) {
  return (
    expected.source === source && expected.destination === fixCastlingDestination(source, destination, sourcePieceRole)
  );
}

export function shouldAutoPlayMove(node: TrainerNode | undefined, studentColor: TrainerColor) {
  if (!node?.move) return false;
  if (node.move.san === "--") return true;
  const mover = moverColor(node);
  if (!mover) return false;
  return mover !== studentColor;
}

export function countStudentMoves(root: TrainerNode | undefined, studentColor: TrainerColor) {
  let count = 0;
  let node = root?.nextPosition;
  while (node) {
    if (node.move && node.move.san !== "--" && moverColor(node) === studentColor) count += 1;
    node = node.nextPosition;
  }
  return count;
}

export function countStudentMovesPlayed(activeNode: TrainerNode | undefined, studentColor: TrainerColor) {
  let count = 0;
  let node = activeNode;
  while (node) {
    if (node.move && node.move.san !== "--" && moverColor(node) === studentColor) count += 1;
    node = node.previousPosition;
  }
  return count;
}
