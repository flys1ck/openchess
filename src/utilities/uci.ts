import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { makeSanAndPlay } from "chessops/san";
import { parseUci } from "chessops/util";
import { UciMove } from "uci-parser-ts";
import { MaybeRef, unref } from "vue";

// generate moves string with SAN
export function getMoveString(fen: MaybeRef<string>, uciMoves: UciMove[]) {
  const fen_ = unref(fen);
  const setup = parseFen(fen_).unwrap();
  const position = Chess.fromSetup(setup).unwrap();

  const initialMoveColor = position.turn;
  const moves = uciMoves.reduce((acc, move) => {
    const uciMove = parseUci(move);
    if (!uciMove) return acc;
    const san = makeSanAndPlay(position, uciMove);
    // san is from previous move, while position is still on current move
    const moveDescriptor = position.turn === "white" ? san : `${position.fullmoves}. ${san}`;
    return `${acc} ${moveDescriptor}`;
  }, "");

  return initialMoveColor === "white" ? moves : `... ${moves}`;
}
