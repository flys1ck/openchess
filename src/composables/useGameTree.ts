import { playAudio } from "@utilities/audio";
import { formatComment } from "@utilities/comment";
import { toSAN } from "@utilities/move";
import { Key, Piece } from "chessground/types";
import { NormalMove, Position, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { ChildNode, PgnNodeData, parsePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { computed, ref } from "vue";

export interface ChessMove {
  source: Key;
  destination: Key;
  san: string;
  piece: Piece;
  isCheck: boolean;
  isCapture: boolean;
  annotations?: number[];
}

// a node describes a position
export interface PositionNode {
  // unique id
  id: string;
  fen: string;
  // amount of half moves played
  ply: number;
  // move is undefined, in the starting position
  move?: ChessMove;
  nextPosition?: PositionNode;
  // last played move before current fen position was reached
  previousPosition?: PositionNode;
  variations: PositionNode[];
  // extras
  comment?: string;
  // only available on variations
  startingComment?: string;
}

interface AddMoveOptions {
  move?: ChessMove;
  comment?: string;
  startingComment?: string;
}

export function useGameTree() {
  const root = ref<PositionNode>();
  const activeNode = ref<PositionNode>();

  /**
   * Add a new node to the tree
   *
   * @param fen FEN string of the position
   * @param options Options for the move
   * @param force force move to be added, even if it already exists on current node
   * @returns newly added node
   */
  function addNode(fen: string, options?: AddMoveOptions, force: boolean = false): PositionNode {
    const nodeId = window.crypto.randomUUID();
    const newNode: PositionNode = {
      id: nodeId,
      fen,
      ply: activeNode.value ? activeNode.value.ply + 1 : 0,
      move: options && options.move,
      previousPosition: activeNode.value,
      comment: options && options.comment,
      startingComment: options && options.startingComment,
      variations: [],
    };

    if (!root.value) root.value = newNode;
    if (activeNode.value) {
      // check if move node exists in tree
      if (activeNode.value.nextPosition && activeNode.value.nextPosition.move?.san === newNode.move?.san && !force) {
        setActiveNode(activeNode.value.nextPosition);
        return newNode;
      } else if (activeNode.value.variations.length) {
        const variation = activeNode.value.variations.find((variation) => variation.move?.san === newNode.move?.san);
        if (variation) {
          setActiveNode(variation);
          return newNode;
        }
      }

      // add move node to tree
      if (activeNode.value.nextPosition) {
        activeNode.value.variations.push(newNode);
      } else {
        activeNode.value.nextPosition = newNode;
      }
    }

    setActiveNode(newNode);
    return newNode;
  }

  function setActiveNode(node: PositionNode) {
    activeNode.value = node;
  }

  function toPreviousMove(cb: (node: PositionNode) => void) {
    if (!activeNode.value || !activeNode.value.previousPosition) return;
    cb(activeNode.value.previousPosition);
  }

  function toNextMove(cb: (node: PositionNode) => void) {
    if (!activeNode.value || !activeNode.value.nextPosition) return;
    if (activeNode.value.nextPosition.move?.san !== "--") {
      if (activeNode.value.nextPosition.move?.isCapture) {
        playAudio("capture", 0.5);
      } else if (activeNode.value.nextPosition.move?.isCheck) {
        // TODO add proper sound
        playAudio("move", 0.5);
      } else {
        playAudio("move", 0.5);
      }
    }
    // TODO check these callbacks
    cb(activeNode.value.nextPosition);
  }

  function toFirstMove(cb: (node: PositionNode) => void) {
    if (!root.value) return;
    cb(root.value);
  }

  function toLastMove(cb: (node: PositionNode) => void) {
    if (!activeNode.value || !activeNode.value.nextPosition) return;

    let node = activeNode.value.nextPosition;
    while (node.nextPosition) {
      node = node.nextPosition;
    }
    cb(node);
  }

  function reset() {
    root.value = undefined;
    activeNode.value = undefined;
  }

  function fromPgn(pgn: string) {
    const games = parsePgn(pgn);
    if (games.length === 0) return;
    reset();

    const game = games[0];
    // add starting position
    const pos = startingPosition(game.headers).unwrap();
    addNode(makeFen(pos.toSetup()), { comment: formatComment(game.comments?.join("") ?? "") });

    const parseChild = (child: ChildNode<PgnNodeData>, position: Position, previousMove?: NormalMove) => {
      const isNullMove = child.data.san === "--";
      const move = parseSan(position, child.data.san) as NormalMove | undefined;
      if ((!isNullMove && !move) || (isNullMove && !previousMove)) return; //illegal move
      if (!isNullMove) position.play(move!);
      const fen = makeFen(position.toSetup());
      const node = addNode(
        fen,
        {
          move: {
            source: isNullMove ? makeSquare(previousMove!.from) : makeSquare(move!.from),
            destination: isNullMove ? makeSquare(previousMove!.to) : makeSquare(move!.to),
            san: child.data.san,
            isCapture: child.data.san.includes("x"),
            isCheck: child.data.san.includes("+"),
            piece: {
              role: isNullMove ? pos.board.getRole(previousMove!.from)! : pos.board.getRole(move!.from)!,
              color: pos.turn,
              promoted: isNullMove ? !!previousMove!.promotion : !!move!.promotion,
            },
            annotations: child.data.nags,
          },
          comment: child.data.comments && formatComment(child.data.comments.join("")),
          startingComment: child.data.startingComments && formatComment(child.data.startingComments.join("")),
        },
        true
      );

      setActiveNode(node);
      if (child.children.length === 0) return;

      parseChild(child.children[0], position.clone(), move);
      child.children.slice(1).forEach((child) => {
        setActiveNode(node!);
        parseChild(child, position.clone(), move);
      });
    };
    game.moves.children.forEach((child) => parseChild(child, pos.clone()));

    if (root.value) setActiveNode(root.value);
  }

  const pgn = computed(() => {
    if (!root.value || !root.value.nextPosition) return "";

    let pgn = "";
    let node: PositionNode | undefined = root.value.nextPosition;
    while (node && node.move) {
      const san = toSAN(node.move);
      // move number
      pgn += node.move.piece.color === "white" ? `${node.ply}. ` : "";
      // SAN notation
      pgn += `${san} `;
      // TODO: checkmate
      // TODO: annotations
      // TODO: comments
      pgn += node.comment ? `{${node.comment}} ` : "";
      node = node.nextPosition;
    }

    return pgn;
  });

  return {
    root,
    activeNode,
    pgn,
    setActiveNode,
    toFirstMove,
    toLastMove,
    toNextMove,
    toPreviousMove,
    addNode,
    reset,
    fromPgn,
  };
}
