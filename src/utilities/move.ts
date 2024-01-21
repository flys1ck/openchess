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

export function toSAN(move: ChessMove) {
  return move.san;
}

export function getPossibleMoves(fen: string) {
  const setup = parseFen(fen).unwrap();
  const position = Chess.fromSetup(setup).unwrap();

  return chessgroundDests(position);
}

export function getPlyCount(fen: string) {
  const parsedFen = parseFen(fen).unwrap();
  const currentMove = parsedFen.fullmoves - 1;
  const turnOffset = parsedFen.turn === "white" ? 0 : 1;
  return currentMove * 2 + turnOffset;
}

// export function toRole(piece: PieceSymbol): Role {
//   const roles: Record<PieceSymbol, Role> = {
//     q: "queen",
//     r: "rook",
//     b: "bishop",
//     n: "knight",
//     p: "pawn",
//     k: "king",
//   };

//   return roles[piece];
// }

// export function toPiece(role: Role): PieceSymbol {
//   const pieces: Record<Role, PieceSymbol> = {
//     queen: "q",
//     rook: "r",
//     bishop: "b",
//     knight: "n",
//     pawn: "p",
//     king: "k",
//   };

//   return pieces[role];
// }

// export function toColor(color: Color): CgColor {
//   const colors: Record<Color, "white" | "black"> = {
//     w: "white",
//     b: "black",
//   };

//   return colors[color];
// }
