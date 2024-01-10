import { Position, useChessground } from "@composables/useChessground";
import { ChessMove, PositionNode, useGameTree } from "@composables/useGameTree";
import { playAudio } from "@utilities/audio";
import { getPossibleMoves, isPromotion } from "@utilities/move";
import { DrawShape } from "chessground/draw";
import { Color, Key, Piece } from "chessground/types";
import { key2pos } from "chessground/util";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { makeSanAndPlay } from "chessops/san";
import { parseSquare } from "chessops/util";
import { CSSProperties, ref, shallowRef } from "vue";

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export function useGame() {
  let pos = Chess.default();
  let board: ReturnType<typeof useChessground> | undefined;
  const tree = useGameTree();
  const fen = ref(makeFen(pos.toSetup()));

  // TODO: promotion to own composable
  const isPromoting = ref(false);
  const promotionStyles = shallowRef<Pick<CSSProperties, "left" | "top" | "flexDirection">>({
    left: "0",
    top: "0",
    flexDirection: "column",
  });
  const promotionColor = shallowRef<Color>("white");
  let promotionSquare: Key;

  let temporaryShapes: DrawShape[] = [];
  let persistentShapes: DrawShape[] = [];

  function initializeBoard(element: HTMLElement, options?: { orientation: "white" | "black" }) {
    const position = {
      fen: fen.value,
      turnColor: pos.turn,
      possibleMoves: getPossibleMoves(fen.value),
      isCheck: pos.isCheck(),
    };
    board = useChessground(element, { orientation: options?.orientation, position, onMove: processMove });
  }

  function createNewGame() {
    pos.reset();
    fen.value = makeFen(pos.toSetup());
    isPromoting.value = false;

    // reset board
    board?.setPosition({ fen: fen.value, turnColor: pos.turn });

    // reset game tree to starting position
    // TODO: check if tree reset is really necessary here
    tree.reset();
    tree.addNode(fen.value);
  }

  function playMove(source: Key, destination: Key) {
    board?.move(source, destination);
  }

  function processMove(source: Key, destination: Key, options?: { promotionPiece?: PromotionPiece }) {
    if (source === "a0" || destination === "a0") return;

    // fix lichess sending UCI for castling as `e1h1, `e1a1` (adheres to chess960 option for chess engines)
    const sourcePieceRole = pos.board.getRole(parseSquare(source));
    let fixedDestination = destination;
    const uci = `${source}${destination}`;
    if (sourcePieceRole === "king" && (uci === "e1a1" || uci === "e1h1" || uci === "e8a8" || uci === "e8h8")) {
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
    const targetPieceRole = pos.board.getRole(parseSquare(fixedDestination));

    const piece = board?.getPiece(fixedDestination);
    if (!piece) return;
    if (isPromotion(fixedDestination, piece.role)) {
      const orientation = board?.getOrientation()!;
      intentPromotion(fixedDestination, pos.turn, orientation);
      return;
    }

    // handle promotion
    const san = makeSanAndPlay(pos, {
      from: parseSquare(source),
      to: parseSquare(fixedDestination),
      promotion: options?.promotionPiece,
    });
    const isEnPassant = sourcePieceRole === "pawn" && targetPieceRole === undefined && source[0] !== destination[0];
    const isCapture = san.includes("x");
    const isCheck = pos.isCheck();

    // remove en passanted pawn
    if (isEnPassant) board?.setPiece((fixedDestination[0] + source[1]) as Key, undefined);
    if (isCheck) board?.setCheck();

    // play move audio
    if (isCapture) {
      playAudio("capture", 0.5);
    } else {
      playAudio("move", 0.5);
    }

    fen.value = makeFen(pos.toSetup());
    board?.setTurn(fen.value, pos.turn);
    // add recent move to game tree
    const nodeMove: ChessMove = {
      source: source,
      destination: fixedDestination,
      san: san,
      isCapture,
      isCheck,
      piece: piece,
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
      turnColor: pos.turn,
      // TODO last move is wrong
      lastMove: board?.getLastMove(),
    };
    board?.setPosition(lastPosition);
    isPromoting.value = false;
  }

  function promote(promotionPiece: PromotionPiece) {
    const piece: Piece = {
      role: promotionPiece,
      color: pos.turn,
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
    const fen_ = parseFen(node.fen).unwrap();
    pos = Chess.fromSetup(fen_).unwrap();

    const lastMove = node.move && [node.move.source, node.move.destination];
    const position: Position = {
      fen: node.fen,
      turnColor: pos.turn,
      lastMove,
    };

    board?.setPosition(position);
    if (node.move?.isCheck) board?.setCheck();
    fen.value = node.fen;
    tree.setActiveNode(node);
  }

  function toggleOrientation() {
    board?.toggleOrientation();
  }

  function setOrientation(orientation: Color) {
    board?.getOrientation() !== orientation && board?.toggleOrientation();
  }

  function setAutoShapes(shapes: DrawShape[], type: "temporary" | "persistent" = "persistent") {
    if (type === "temporary") {
      if (shapes === temporaryShapes) return;
      temporaryShapes = shapes;
    } else {
      if (shapes === persistentShapes) return;
      persistentShapes = shapes;
    }
    if (temporaryShapes.length === 0) {
      board?.setAutoShapes(persistentShapes);
    } else {
      board?.setAutoShapes(temporaryShapes);
    }
  }

  return {
    fen,
    tree,
    isPromoting,
    promotionColor,
    promotionStyles,
    initializeBoard,
    createNewGame,
    cancelPromotion,
    promote,
    setActivePosition,
    toggleOrientation,
    setOrientation,
    playMove,
    setAutoShapes,
  };
}
