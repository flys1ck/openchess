import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { defaultGame, extend, makePgn, type PgnNodeData } from "chessops/pgn";
import { makeSanAndPlay } from "chessops/san";
import { defaultSetup } from "chessops/setup";
import type { DropMove, Move, NormalMove, Role } from "chessops/types";
import { parseSquare } from "chessops/util";

const TCN_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*+=";

const PROMOTION_ROLES: Role[] = ["queen", "knight", "rook", "bishop", "king", "pawn"];

function squareName(index: number): string {
  return `${TCN_CHARS[index % 8]}${Math.floor(index / 8) + 1}`;
}

/**
 * Decodes a Chess.com TCN move list into chessops moves.
 */
export function decodeTcn(tcn: string): Move[] {
  const moves: Move[] = [];

  for (let i = 0; i < tcn.length; i += 2) {
    let fromIndex = TCN_CHARS.indexOf(tcn[i]);
    let toIndex = TCN_CHARS.indexOf(tcn[i + 1]);
    let promotion: Role | undefined;

    if (toIndex > 63) {
      promotion = PROMOTION_ROLES[Math.floor((toIndex - 64) / 3)];
      toIndex = fromIndex + (fromIndex < 16 ? -8 : 8) + ((toIndex - 1) % 3) - 1;
    }

    if (fromIndex > 75) {
      const drop: DropMove = {
        role: PROMOTION_ROLES[fromIndex - 79],
        to: parseSquare(squareName(toIndex))!,
      };
      moves.push(drop);
    } else {
      const normal: NormalMove = {
        from: parseSquare(squareName(fromIndex))!,
        to: parseSquare(squareName(toIndex))!,
      };
      if (promotion) normal.promotion = promotion;
      moves.push(normal);
    }
  }

  return moves;
}

/**
 * Builds a PGN string from a TCN move list and optional headers.
 */
export function tcnToPgn(tcn: string, headers: Record<string, string | number> = {}, initialSetup = ""): string {
  const headerMap = new Map(Object.entries(headers).map(([key, value]) => [key, String(value)]));
  const game = defaultGame<PgnNodeData>(() => headerMap);
  const setup = initialSetup.trim() ? parseFen(initialSetup.trim()).unwrap() : defaultSetup();
  const position = Chess.fromSetup(setup).unwrap();
  const nodes: PgnNodeData[] = decodeTcn(tcn).map((move) => ({ san: makeSanAndPlay(position, move) }));
  extend(game.moves.end(), nodes);
  return makePgn(game);
}
