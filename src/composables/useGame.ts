import { Position, useChessground } from "@composables/useChessground";
import { useEvaluation } from "@composables/useEvaluation";
import { ChessMove, PositionNode, useGameTree } from "@composables/useGameTree";
import { playAudio } from "@utilities/audio";
import { isPromotion, toPiece, toPossibleMoves } from "@utilities/move";
import { Chess } from "chess.js";
import { Color, Dests, Key, Piece } from "chessground/types";
import { key2pos } from "chessground/util";
import { CSSProperties, ref, shallowRef } from "vue";

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export function useGame() {
  const chess = new Chess();
  let chessground: ReturnType<typeof useChessground> | undefined;
  const gameTree = useGameTree();

  const fen = ref(chess.fen());
  const evaluation = useEvaluation(fen);
  // TODO: revisit if they need to be refs
  const turnColor = ref<Color>("white");
  const possibleMoves = ref<Dests>();

  const isPromoting = ref(false);
  const promotionStyles = shallowRef<Pick<CSSProperties, "left" | "top" | "flexDirection">>({
    left: "0",
    top: "0",
    flexDirection: "column",
  });
  const promotionColor = shallowRef<Color>("white");
  let promotionSquare: Key;

  function initializeBoard(element: HTMLElement) {
    const move = chess.history({ verbose: true }).at(-1);

    const position = {
      fen: chess.fen(),
      turnColor: (chess.turn() === "w" ? "white" : "black") as Color,
      possibleMoves: toPossibleMoves(chess.moves({ verbose: true })),
      isCheck: chess.isCheck(),
      lastMove: move && [move.from, move.to],
    };
    chessground = useChessground(element, { position, onMove: processMove });
  }

  function createNewGame() {
    chess.reset();
    fen.value = chess.fen();
    turnColor.value = chess.turn() === "w" ? "white" : "black";
    possibleMoves.value = toPossibleMoves(chess.moves({ verbose: true }));

    isPromoting.value = false;

    // reset board
    chessground?.setPosition({ fen: fen.value, turnColor: turnColor.value, possibleMoves: possibleMoves.value });

    // reset game tree to starting position
    gameTree.reset();
    const node = gameTree.addNode(fen.value, possibleMoves.value);
    gameTree.setActiveNode(node);
  }

  function processMove(source: Key, destination: Key, options?: { promotionPiece?: PromotionPiece }) {
    // handle promotion
    const piece = chessground?.getPiece(destination);
    if (!piece) return;
    if (isPromotion(destination, piece.role)) {
      const orientation = chessground?.getOrientation()!;
      intentPromotion(destination, turnColor.value, orientation);
      return;
    }

    const move = chess.move({
      from: source,
      to: destination,
      promotion: options?.promotionPiece && toPiece(options.promotionPiece),
    });
    const isCapture = move.flags.includes("c") || move.flags.includes("e");
    const isEnPassant = move.flags.includes("e");
    const isCheck = chess.inCheck();

    // remove en passanted pawn
    if (isEnPassant) chessground?.setPiece((destination[0] + source[1]) as Key, undefined);

    if (isCheck) chessground?.setCheck();

    // play move audio
    if (isCapture) {
      playAudio("capture", 0.5);
    } else {
      playAudio("move", 0.5);
    }

    // set up board for next move
    fen.value = chess.fen();
    turnColor.value = chess.turn() === "w" ? "white" : "black";
    possibleMoves.value = toPossibleMoves(chess.moves({ verbose: true }));

    chessground?.setTurn(turnColor.value, possibleMoves.value);

    // add recent move to game tree
    const nodeMove: ChessMove = {
      source: move.from,
      destination: move.to,
      isCapture,
      isCheck,
      piece,
    };
    const node = gameTree.addNode(fen.value, possibleMoves.value, { move: nodeMove });
    gameTree.setActiveNode(node);
  }

  // TODO try to do it without turn color (can be inferred by the square)
  function intentPromotion(square: Key, turnColor: Color, orientation: Color) {
    isPromoting.value = true;

    promotionColor.value = turnColor;
    // TODO: fix styles when flipping board
    promotionStyles.value = {
      left: (key2pos(square)[0] * 100) / 8 + "%",
      top: turnColor === "white" ? "0" : "50%",
      flexDirection: turnColor === orientation ? "column" : "column-reverse",
    };
    promotionSquare = square;
  }

  function cancelPromotion() {
    const lastPosition: Position = {
      fen: fen.value,
      turnColor: turnColor.value,
      // TODO last move is wrong
      lastMove: chessground?.getLastMove(),
      possibleMoves: possibleMoves.value,
    };
    chessground?.setPosition(lastPosition);
    isPromoting.value = false;
  }

  function promote(promotionPiece: PromotionPiece) {
    const piece: Piece = {
      role: promotionPiece,
      color: turnColor.value,
      promoted: true,
    };
    const lastMove = chessground?.getLastMove();
    if (!lastMove) return;

    // TODO fix very weird animation, when setting piece
    chessground?.setPiece(promotionSquare, piece);
    processMove(lastMove[0], lastMove[1], { promotionPiece });
    isPromoting.value = false;
  }

  function setActivePosition(node: PositionNode) {
    fen.value = node.fen;
    turnColor.value = node.move?.piece.color === "white" ? "black" : "white";
    possibleMoves.value = node.possibleMoves;

    const lastMove = node.move && [node.move.source, node.move.destination];
    const position: Position = {
      fen: node.fen,
      turnColor: turnColor.value,
      lastMove,
      possibleMoves: node.possibleMoves,
    };

    chessground?.setPosition(position);
    gameTree.setActiveNode(node);
  }

  return {
    board: chessground,
    tree: gameTree,
    evaluation,
    isPromoting,
    promotionColor,
    promotionStyles,
    fen,
    turnColor,
    possibleMoves,
    initializeBoard,
    createNewGame,
    cancelPromotion,
    promote,
    processMove,
    setActivePosition,
  };
}
