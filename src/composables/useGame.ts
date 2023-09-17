import { Position, useChessground } from "@composables/useChessground";
import { ChessMove, PositionNode, useGameTree } from "@composables/useGameTree";
import { playAudio } from "@utilities/audio";
import { isPromotion, toColor, toPiece, toPossibleMoves } from "@utilities/move";
import { Chess } from "chess.js";
import { DrawShape } from "chessground/draw";
import { Color, Key, Piece } from "chessground/types";
import { key2pos } from "chessground/util";
import { CSSProperties, ref, shallowRef } from "vue";

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export function useGame() {
  const chess = new Chess();
  let board: ReturnType<typeof useChessground> | undefined;
  const tree = useGameTree();
  const turnColor = ref<Color>("white");

  const fen = ref(chess.fen());

  // TODO: promotion to own composable
  const isPromoting = ref(false);
  const promotionStyles = shallowRef<Pick<CSSProperties, "left" | "top" | "flexDirection">>({
    left: "0",
    top: "0",
    flexDirection: "column",
  });
  const promotionColor = shallowRef<Color>("white");
  let promotionSquare: Key;

  function initializeBoard(element: HTMLElement, options?: { orientation: "white" | "black" }) {
    const move = chess.history({ verbose: true }).at(-1);

    const position = {
      fen: chess.fen(),
      turnColor: toColor(chess.turn()),
      possibleMoves: toPossibleMoves(chess.moves({ verbose: true })),
      isCheck: chess.isCheck(),
      lastMove: move && [move.from, move.to],
    };
    board = useChessground(element, { orientation: options?.orientation, position, onMove: processMove });
  }

  function createNewGame() {
    chess.reset();
    fen.value = chess.fen();
    turnColor.value = toColor(chess.turn());
    isPromoting.value = false;

    // reset board
    board?.setPosition({ fen: fen.value, turnColor: turnColor.value });

    // reset game tree to starting position
    // TODO: check if tree reset is really necessary here
    tree.reset();
    tree.addNode(fen.value);
  }

  function playMove(source: Key, destination: Key) {
    board?.move(source, destination);
  }

  function processMove(source: Key, destination: Key, options?: { promotionPiece?: PromotionPiece }) {
    // fix lichess sending UCI for castling as `e1h1, `e1a1`
    if (source === "a0" || destination === "a0") return;
    const sourcePiece = chess.get(source);
    let fixedDestination = destination;
    const uci = `${source}${destination}`;
    if (sourcePiece.type === "k" && (uci === "e1a1" || uci === "e1h1" || uci === "e8a8" || uci === "e8h8")) {
      switch (uci) {
        case "e1a1":
          fixedDestination = "c1";
          break;
        case "e1h1":
          fixedDestination = "g1";
          break;
        case "e8a8":
          fixedDestination = "c8";
          break;
        case "e8h8":
          fixedDestination = "g8";
          break;
      }
    }

    const piece = board?.getPiece(fixedDestination);
    if (!piece) return;
    if (isPromotion(fixedDestination, piece.role)) {
      const orientation = board?.getOrientation()!;
      intentPromotion(fixedDestination, turnColor.value, orientation);
      return;
    }

    // handle promotion
    const move = chess.move({
      from: source,
      to: fixedDestination,
      promotion: options?.promotionPiece && toPiece(options.promotionPiece),
    });
    const isCapture = move.flags.includes("c") || move.flags.includes("e");
    const isEnPassant = move.flags.includes("e");
    const isCheck = chess.inCheck();

    // remove en passanted pawn
    if (isEnPassant) board?.setPiece((fixedDestination[0] + source[1]) as Key, undefined);

    if (isCheck) board?.setCheck();

    // play move audio
    if (isCapture) {
      playAudio("capture", 0.5);
    } else {
      playAudio("move", 0.5);
    }

    // set up board for next move
    fen.value = chess.fen();
    turnColor.value = toColor(chess.turn());

    board?.setTurn(fen.value, turnColor.value);

    // add recent move to game tree
    const nodeMove: ChessMove = {
      source: move.from,
      destination: move.to,
      san: move.san,
      isCapture,
      isCheck,
      piece,
    };
    tree.addNode(fen.value, { move: nodeMove });
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
      lastMove: board?.getLastMove(),
    };
    board?.setPosition(lastPosition);
    isPromoting.value = false;
  }

  function promote(promotionPiece: PromotionPiece) {
    const piece: Piece = {
      role: promotionPiece,
      color: turnColor.value,
      promoted: true,
    };
    const lastMove = board?.getLastMove();
    if (!lastMove) return;

    // TODO fix very weird animation, when setting piece
    board?.setPiece(promotionSquare, piece);
    processMove(lastMove[0], lastMove[1], { promotionPiece });
    isPromoting.value = false;
  }

  function setActivePosition(node: PositionNode) {
    chess.load(node.fen);
    fen.value = node.fen;
    turnColor.value = node.move?.piece.color === "white" ? "black" : "white";

    const lastMove = node.move && [node.move.source, node.move.destination];
    const position: Position = {
      fen: node.fen,
      turnColor: turnColor.value,
      lastMove,
    };

    board?.setPosition(position);
    if (node.move?.isCheck) board?.setCheck();

    tree.setActiveNode(node);
  }

  function toggleOrientation() {
    board?.toggleOrientation();
  }

  function setAutoShapes(shapes: DrawShape[]) {
    board?.setAutoShapes(shapes);
  }

  return {
    tree,
    isPromoting,
    promotionColor,
    promotionStyles,
    fen,
    turnColor,
    initializeBoard,
    createNewGame,
    cancelPromotion,
    promote,
    setActivePosition,
    toggleOrientation,
    playMove,
    setAutoShapes,
  };
}
