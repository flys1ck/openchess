import { ChessMove } from "@composables/useGameTree";
import { Color, Move, PieceSymbol } from "chess.js";
import { Dests, Key, Role } from "chessground/types";

export function isEnPassant(source: Key, destination: Key, pieceOnDestination: Role | undefined) {
  return source[0] !== destination[0] && pieceOnDestination === "pawn";
}

export function isPromotion(destination: Key, pieceOnDestination: Role | undefined) {
  return pieceOnDestination === "pawn" && (destination[1] === "1" || destination[1] === "8");
}

const pieceCodes = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
  pawn: "",
};

export function toSAN(move: ChessMove) {
  return move.san;
}

export function toPossibleMoves(moves: Move[]): Dests {
  return moves.reduce((acc, move) => {
    if (!acc.has(move.from)) return acc.set(move.from, [move.to]);
    const dests = acc.get(move.from);
    dests?.push(move.to);
    return acc.set(move.from, dests!);
  }, new Map<Key, Key[]>());
}

export function toRole(piece: PieceSymbol): Role {
  const roles: Record<PieceSymbol, Role> = {
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
    p: "pawn",
    k: "king",
  };

  return roles[piece];
}

export function toPiece(role: Role): PieceSymbol {
  const pieces: Record<Role, PieceSymbol> = {
    queen: "q",
    rook: "r",
    bishop: "b",
    knight: "n",
    pawn: "p",
    king: "k",
  };

  return pieces[role];
}

export function toColor(color: Color): "white" | "black" {
  const colors: Record<Color, "white" | "black"> = {
    w: "white",
    b: "black",
  };

  return colors[color];
}
