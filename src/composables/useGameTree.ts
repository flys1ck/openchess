import { ParseTree, parse } from "@mliebelt/pgn-parser";
import { playAudio } from "@utilities/audio";
import { toColor, toPossibleMoves, toRole, toSAN } from "@utilities/move";
import { Chess } from "chess.js";
import { Dests, Key, Piece } from "chessground/types";
import { computed, ref } from "vue";

export interface ChessMove {
  source: Key;
  destination: Key;
  san: string;
  piece: Piece;
  isCheck: boolean;
  isCapture: boolean;
  annotations?: string[];
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
  // move is undefined, in the starting position
  move?: ChessMove;
  nextPosition?: PositionNode;
  // last played move before current fen position was reached
  previousPosition?: PositionNode;
  variations: PositionNode[];
  // extras
  comment?: string;
}

interface AddMoveOptions {
  move?: ChessMove;
  comment?: string;
}

export function useGameTree() {
  const root = ref<PositionNode>();
  const activeNode = ref<PositionNode>();

  function addNode(fen: string, options?: AddMoveOptions) {
    const nodeId = window.crypto.randomUUID();
    const newNode: PositionNode = {
      id: nodeId,
      fen,
      ply: activeNode.value ? activeNode.value.ply + 1 : 0,
      move: options && options.move,
      previousPosition: activeNode.value,
      comment: options && options.comment,
      variations: [],
    };

    if (!root.value) root.value = newNode;
    if (activeNode.value) {
      if (activeNode.value.nextPosition) {
        activeNode.value.variations.push(newNode);
      } else {
        activeNode.value.nextPosition = newNode;
      }
    }

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

  function fromPgn(pgn: string) {
    reset();

    const parsedPgn = parse(pgn, { startRule: "game" }) as ParseTree;

    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history({ verbose: true });
    const parsedMoves = parsedPgn.moves;

    if (history.length !== parsedMoves.length) throw new Error("Error while parsing PGN");

    if (!history.length) return;
    const firstMove = history[0];
    chess.load(firstMove.before);

    const rootNode = addNode(firstMove.before, {
      comment: parsedPgn.gameComment?.comment,
    });
    root.value = rootNode;
    activeNode.value = rootNode;

    history.forEach((move, i) => {
      // TODO: highly inefficient, probably calculate possible moves on the fly
      chess.load(move.before);
      const possibleMoves = toPossibleMoves(chess.moves({ verbose: true }));
      chess.load(move.after);
      const node = addNode(move.after, {
        move: {
          source: move.from,
          destination: move.to,
          san: move.san,
          isCapture: move.flags.includes("c"),
          isCheck: chess.isCheck(),
          piece: {
            role: toRole(move.piece),
            color: toColor(move.color),
            promoted: move.flags.includes("p"),
          },
          annotations: parsedMoves[i].nag,
        },
        comment: parsedMoves[i].commentAfter,
      });

      setActiveNode(node);
    });

    // reset active node to root position after import
    setActiveNode(root.value);
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
