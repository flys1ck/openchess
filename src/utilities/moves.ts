import type { Key } from "chessground/types";
import type { Rules } from "chessops";
import { Chess } from "chessops/chess";
import { INITIAL_BOARD_FEN, INITIAL_FEN, makeFen, parseFen } from "chessops/fen";
import { makeSanAndPlay, parseSan } from "chessops/san";
import { makeSquare, parseUci } from "chessops/util";
import { setupPosition } from "chessops/variant";
import { UciMove } from "uci-parser-ts";
import { MaybeRef, unref } from "vue";

/**
 * Generates SAN move string from a given starting fen and list of UCI moves.
 */
export function getMovesStringFromUci(uciMoves: UciMove[], fen: MaybeRef<string>) {
  const fen_ = unref(fen);
  const setup = parseFen(fen_).unwrap();
  const position = Chess.fromSetup(setup).unwrap();

  const initialMoveColor = position.turn;
  let hasNullMove = false;
  const moves = uciMoves.reduce((acc, move) => {
    if (hasNullMove) return acc;
    const uciMove = parseUci(move);
    if (!uciMove) return acc;
    const san = makeSanAndPlay(position, uciMove);
    if (san === "--") {
      hasNullMove = true;
      return acc;
    }
    // san is from previous move, while position is still on current move
    const moveDescriptor = position.turn === "white" ? san : `${position.fullmoves}. ${san}`;
    return `${acc} ${moveDescriptor}`;
  }, "");

  return initialMoveColor === "white" ? moves : `... ${moves}`;
}

/**
 * Generates SAN move string from a given starting fen and list of SAN moves.
 */
export function getMoveStringFromSan(sanMoves: string[], fen?: MaybeRef<string>) {
  if (sanMoves.length === 0) return "";
  const fen_ = unref(fen) ?? INITIAL_BOARD_FEN;
  const parsedFen = parseFen(fen_).unwrap();

  const turn = parsedFen.turn;
  const moveCount = parsedFen.fullmoves;
  const plyCount = parsedFen.halfmoves;
  const moveString = sanMoves
    .reduce((acc, sanMove, i) => {
      const currentPly = plyCount + i;
      const currentMove = Math.floor(currentPly / 2) + 1;
      return currentPly % 2 === 0 ? `${acc} ${currentMove}.${sanMove}` : `${acc} ${sanMove}`;
    }, "")
    .trim();

  return turn === "white" ? moveString : `${moveCount}... ${moveString}`;
}

export interface FinalPosition {
  fen: string;
  lastMove?: [Key, Key];
}

/**
 * Plays SAN moves from a starting fen and returns the position they reach. Stops at the first move that does not parse.
 */
export function getFinalPosition(sanMoves: string[], fen = INITIAL_FEN, rules: Rules = "chess"): FinalPosition {
  const position = setupPosition(rules, parseFen(fen).unwrap()).unwrap();
  let lastMove: FinalPosition["lastMove"];
  for (const san of sanMoves) {
    const move = parseSan(position, san);
    if (!move) break;
    position.play(move);
    lastMove = "from" in move ? [makeSquare(move.from), makeSquare(move.to)] : undefined;
  }

  return { fen: makeFen(position.toSetup()), lastMove };
}
