import { Chess } from "chess.js";
import { UciMove } from "uci-parser-ts";
import { MaybeRef, unref } from "vue";

// generate moves string with SAN
export function getMoveString(fen: MaybeRef<string>, uciMoves: UciMove[]) {
  const chess = new Chess();

  const fen_ = unref(fen);
  chess.load(fen_);
  const initialMoveNumber = chess.moveNumber();
  const turnColor = chess.turn();
  const movesString = uciMoves.reduce((acc, uciMove) => {
    const move = chess.move(uciMove);
    const moveDescriptor = move.color === "w" ? `${chess.moveNumber()}. ${move.san}` : `${move.san}`;
    return `${acc} ${moveDescriptor}`;
  }, "");

  return turnColor === "w" ? movesString : `${initialMoveNumber} ... ${movesString}`;
}
