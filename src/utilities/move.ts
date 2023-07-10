import { ChessMove } from "@stores/useGameTree";
import { Key, Role } from "chessground/types";

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
  const pieceCode = pieceCodes[move.piece.role];

  const uci = `${move.source}${move.destination}`;
  if (uci === "e1g1" || uci === "e8g8") return "0-0";
  if (uci === "e1c1" || uci === "e8c8") return "0-0-0";

  const parts = [
    move.piece.role === "pawn" ? (move.isCapture ? move.source[0] : pieceCode) : pieceCode,
    move.isCapture ? "x" : "",
    move.destination,
    move.isCheck ? "+" : "",
  ];

  return parts.join("");
}
