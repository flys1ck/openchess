import { parsePgn } from "@services/game";
import { playAudio } from "@utilities/audio";
import { toSAN } from "@utilities/move";
import { Dests, Key, Piece } from "chessground/types";
import { computed, ref } from "vue";

export interface ChessMove {
  source: Key;
  destination: Key;
  piece: Piece;
  isCheck: boolean;
  isCapture: boolean;
  annotation?: string;
}

// TODO rename turncolor to movecolor
// TODO: consider evaluation and comments
// TODO can also cache possible moves, to avoid recalculation

// a node describes a position
export interface PositionNode {
  // id generated from last move (not unique)
  id: string;
  fen: string;
  // amount of half moves played
  ply: number;
  // possible moves in the current position
  possibleMoves?: Dests;
  // move is undefined, in the starting position
  move?: ChessMove;
  nextPosition?: PositionNode;
  // last played move before current fen position was reached
  previousPosition?: PositionNode;
  variations?: PositionNode[];
  // extras
  comment: string;
}

interface AddMoveOptions {
  move?: ChessMove;
  comment?: string;
}

export function useGameTree() {
  const root = ref<PositionNode>();
  const activeNode = ref<PositionNode>();

  function addNode(fen: string, possibleMoves: Dests, options?: AddMoveOptions) {
    const nodeId = window.crypto.randomUUID();
    const newNode: PositionNode = {
      id: nodeId,
      fen,
      ply: activeNode.value ? activeNode.value.ply + 1 : 0,
      move: options && options.move,
      previousPosition: activeNode.value,
      possibleMoves,
      comment: (options && options.comment) ?? "",
    };

    if (!root.value) root.value = newNode;
    if (activeNode.value) activeNode.value.nextPosition = newNode;

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
    if (activeNode.value.nextPosition.move?.isCapture) {
      playAudio("capture", 0.5);
    } else if (activeNode.value.nextPosition.move?.isCheck) {
      // TODO add proper sound
      playAudio("move", 0.5);
    } else {
      playAudio("move", 0.5);
    }
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

  async function fromPGN(pgn: string) {
    // TODO: import breaks possibleMoves
    const nodes = await parsePgn(pgn);
    reset();
    nodes.forEach((node) => {
      const parsedNode = addNode(node.fen, node.possibleMoves as unknown as Dests, {
        move: (node.chessMove as unknown as ChessMove) ?? undefined,
        comment: node.comment ?? "",
      });

      if (root.value && activeNode.value) {
        activeNode.value.nextPosition = parsedNode;
      } else {
        root.value = parsedNode;
      }
      activeNode.value = parsedNode;
    });
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
    fromPGN,
  };
}
