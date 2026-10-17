import { ChessMove } from "@composables/useGameTree";
import { Key, Role } from "chessground/types";
import { Chess } from "chessops/chess";
import { chessgroundDests } from "chessops/compat";
import { parseFen } from "chessops/fen";

export function isEnPassant(source: Key, destination: Key, pieceOnDestination: Role | undefined) {
  return source[0] !== destination[0] && pieceOnDestination === "pawn";
}

export function isPromotion(destination: Key, pieceOnDestination: Role | undefined) {
  return pieceOnDestination === "pawn" && (destination[1] === "1" || destination[1] === "8");
}

export function fixCastlingDestination(source: Key, destination: Key, sourcePieceRole?: string | null) {
  if (sourcePieceRole !== "king") return destination;
  switch (`${source}${destination}`) {
    case "e1a1":
      return "c1";
    case "e1h1":
      return "g1";
    case "e8a8":
      return "c8";
    case "e8h8":
      return "g8";
    default:
      return destination;
  }
}

export function toSAN(move: ChessMove) {
  return move.san;
}

export function getPossibleMoves(fen: string) {
  const setup = parseFen(fen).unwrap();
  const position = Chess.fromSetup(setup).unwrap();

  return chessgroundDests(position);
}

export function getPositionKey(fen: string) {
  const fields = fen.trim().split(/\s+/);
  if (fields.length !== 6) throw new Error("Expected a complete FEN");

  return fields.slice(0, 4).join(" ");
}
