import { Chess } from "chessops/chess";
import { INITIAL_BOARD_FEN, parseFen } from "chessops/fen";
import { makeSanAndPlay } from "chessops/san";
import { parseUci } from "chessops/util";
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
 *  Generates SAN move string from a given starting fen and list of SAN moves.
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

  return turn === "white" ? moveString : `${moveCount} ... ${moveString}`;
}
