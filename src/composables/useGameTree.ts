import { playAudio } from "@utilities/audio";
import { formatComment } from "@utilities/comment";
import { toSAN } from "@utilities/move";
import { Key, Piece } from "chessground/types";
import { NormalMove, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { parsePgn, startingPosition } from "chessops/pgn";
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
      // check if move node exists in tree
      if (activeNode.value.nextPosition && activeNode.value.nextPosition.move?.san === newNode.move?.san) {
        setActiveNode(activeNode.value.nextPosition);
        return;
      } else if (activeNode.value.variations.length) {
        const variation = activeNode.value.variations.find((variation) => variation.move?.san === newNode.move?.san);
        if (variation) {
          setActiveNode(variation);
          return;
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
    return;
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
    const games = parsePgn(pgn);
    if (games.length === 0) return;
    reset();

    const game = games[0];
    const pos = startingPosition(game.headers).unwrap();
    addNode(makeFen(pos.toSetup()), { comment: formatComment(game.comments?.join("") ?? "") });

    for (const node of game.moves.mainline()) {
      const move = parseSan(pos, node.san) as NormalMove;
      // TODO: main line null moves will be marked as illegal
      if (!move) break; //illegal moves
      pos.play(move);
      addNode(makeFen(pos.toSetup()), {
        move: {
          source: makeSquare(move.from),
          destination: makeSquare(move.to),
          san: node.san,
          isCapture: node.san.includes("x"),
          isCheck: node.san.includes("+"),
          piece: {
            role: pos.board.getRole(move.from)!,
            color: pos.turn,
            promoted: move.promotion !== undefined,
          },
          // TODO
          annotations: node.nags,
        },
        comment: formatComment(node.comments?.join("") ?? ""),
      });
    }

    // reset active node to root position after import
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
