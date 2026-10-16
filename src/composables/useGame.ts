import { MovableColor, Position, useChessground } from "@composables/useChessground";
import { ChessMove, PositionNode, useGameTree } from "@composables/useGameTree";
import { playAudio } from "@utilities/audio";
import { fixCastlingDestination, getPossibleMoves, isPromotion } from "@utilities/move";
import { DrawShape } from "chessground/draw";
import { Color, Key, Piece } from "chessground/types";
import { key2pos } from "chessground/util";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { makeSanAndPlay } from "chessops/san";
import { parseSquare } from "chessops/util";
import { CSSProperties, ref, shallowRef } from "vue";

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export interface InitializeBoardOptions {
  orientation?: "white" | "black";
  movableColor?: MovableColor;
}

export interface GameMoveConfig {
  movableColor?: MovableColor;
  moveGuard?: (source: Key, destination: Key) => boolean;
  onMovePlayed?: () => void;
}

export function useGame() {
  let pos = Chess.default();
  let board: ReturnType<typeof useChessground> | undefined;
  const tree = useGameTree();
  const fen = ref(makeFen(pos.toSetup()));
  let movableColor: MovableColor | undefined;
  let moveGuard: ((source: Key, destination: Key) => boolean) | undefined;
  let onMovePlayed: (() => void) | undefined;

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

  function initializeBoard(element: HTMLElement, options?: InitializeBoardOptions) {
    if (options?.movableColor !== undefined) movableColor = options.movableColor;
    const position = {
      fen: fen.value,
      turnColor: pos.turn,
      possibleMoves: getPossibleMoves(fen.value),
      isCheck: pos.isCheck(),
    };
    board = useChessground(element, {
      orientation: options?.orientation,
      position,
      onMove: processMove,
      movableColor,
    });
  }

  function configureMoves(options: GameMoveConfig) {
    if (options.movableColor !== undefined) movableColor = options.movableColor;
    if (options.moveGuard) moveGuard = options.moveGuard;
    if (options.onMovePlayed) onMovePlayed = options.onMovePlayed;
    board?.setMovableColor(movableColor);
    board?.setTurn(fen.value, pos.turn);
  }

  function setMovableColor(color: MovableColor | undefined) {
    movableColor = color;
    board?.setMovableColor(color);
    board?.setTurn(fen.value, pos.turn);
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

  function toPreviousMove(cb?: (node: PositionNode) => void) {
    const previousPosition = tree.activeNode.value?.previousPosition;
    if (!previousPosition) return;

    setActivePosition(previousPosition);
    if (cb) cb(previousPosition);
  }

  function toNextMove(cb?: (node: PositionNode) => void) {
    const nextPosition = tree.activeNode.value?.nextPosition;
    if (!nextPosition) return;
    if (nextPosition.move?.san !== "--") {
      if (nextPosition.move?.isCapture) {
        void playAudio("capture", 0.5);
      } else if (nextPosition.move?.isCheck) {
        // TODO add proper sound
        void playAudio("move", 0.5);
      } else {
        void playAudio("move", 0.5);
      }
    }

    setActivePosition(nextPosition);
    if (cb) cb(nextPosition);
  }

  function toFirstMove(cb?: (node: PositionNode) => void) {
    const root = tree.root.value;
    if (!root) return;

    setActivePosition(root);
    if (cb) cb(root);
  }

  function toLastMove(cb?: (node: PositionNode) => void) {
    let node = tree.activeNode.value?.nextPosition;
    while (node?.nextPosition) {
      node = node.nextPosition;
    }
    if (!node) return;

    setActivePosition(node);
    if (cb) cb(node);
  }

  function restorePosition() {
    const node = tree.activeNode.value;
    const lastMove = node?.move && ([node.move.source, node.move.destination] as Key[]);
    board?.setPosition({
      fen: fen.value,
      turnColor: pos.turn,
      lastMove,
      isCheck: pos.isCheck(),
    });
  }

  function processMove(source: Key, destination: Key, options?: { promotionPiece?: PromotionPiece }) {
    if (source === "a0" || destination === "a0") return;

    const from = parseSquare(source);
    if (from === undefined) return;

    // fix lichess sending UCI for castling as `e1h1, `e1a1` (adheres to chess960 option for chess engines)
    const sourcePieceRole = pos.board.getRole(from);
    const fixedDestination = fixCastlingDestination(source, destination, sourcePieceRole);
    if (moveGuard && !moveGuard(source, fixedDestination)) {
      restorePosition();
      return;
    }
    const to = parseSquare(fixedDestination);
    if (to === undefined) return;
    const targetPieceRole = pos.board.getRole(to);

    const piece = board?.getPiece(fixedDestination);
    if (!piece) return;
    if (isPromotion(fixedDestination, piece.role)) {
      const orientation = board?.getOrientation();
      if (orientation) intentPromotion(fixedDestination, pos.turn, orientation);
      return;
    }

    // handle promotion
    const san = makeSanAndPlay(pos, {
      from,
      to,
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
      void playAudio("capture", 0.5);
    } else {
      void playAudio("move", 0.5);
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
    onMovePlayed?.();
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

  function setActivePositionByPlyCount(plyCount: number) {
    if (!tree.root.value) return;
    let currentNode = tree.root.value;
    while (currentNode.nextPosition !== undefined) {
      if (currentNode.ply === plyCount) {
        setActivePosition(currentNode);
        return;
      }
      currentNode = currentNode.nextPosition;
    }
  }

  function toggleOrientation() {
    board?.toggleOrientation();
  }

  function setOrientation(orientation: Color) {
    if (board?.getOrientation() !== orientation) board?.toggleOrientation();
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
    configureMoves,
    setMovableColor,
    createNewGame,
    cancelPromotion,
    promote,
    setActivePosition,
    setActivePositionByPlyCount,
    toggleOrientation,
    setOrientation,
    playMove,
    setAutoShapes,
    toPreviousMove,
    toNextMove,
    toFirstMove,
    toLastMove,
  };
}
