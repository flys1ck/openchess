import { type GameJson, type GamePlayerUser, type GameStatusName } from "@flys1ck/lichess-client";
import { ChessDotComGame } from "@services/chessdotcom";
import { type FinalPosition, getFinalPosition, getMoveStringFromSan } from "@utilities/moves";
import { lichessRules } from "chessops/compat";
import { parsePgn } from "chessops/pgn";

export type GameColor = "white" | "black";
export type GameResult = GameColor | "draw";

export interface ChessGame {
  id: string;
  players: {
    white: {
      name: string;
      rating?: number;
      ratingDiff?: number;
    };
    black: {
      name: string;
      rating?: number;
      ratingDiff?: number;
    };
  };
  opening?: {
    name: string;
  };
  variant: string;
  speed?: string;
  result?: GameResult;
  moves: string;
  plyCount: number;
  initialFen?: string;
  finalPosition: FinalPosition;
  clock?: {
    initial: number;
    increment: number;
  };
  createdAt: number;
}

// Lichess sets no winner for these, and they are not draws either.
const UNDECIDED_LICHESS_STATUSES = new Set<GameStatusName>([
  "created",
  "started",
  "aborted",
  "noStart",
  "unknownFinish",
]);

export function normalizeLichessGame(lichessGame: GameJson): ChessGame {
  const { id, players, opening, variant, speed, status, winner, moves, clock, createdAt, initialFen } = lichessGame;
  const white = normalizeLichessPlayer(players.white);
  const black = normalizeLichessPlayer(players.black);
  const sanMoves = moves?.split(" ").filter(Boolean) ?? [];
  const game: ChessGame = {
    id,
    players: { white, black },
    opening: opening ? { name: opening.name } : undefined,
    variant,
    speed,
    result: winner ?? (UNDECIDED_LICHESS_STATUSES.has(status) ? undefined : "draw"),
    moves: getMoveStringFromSan(sanMoves, initialFen),
    plyCount: sanMoves.length,
    initialFen,
    finalPosition: getFinalPosition(sanMoves, initialFen, lichessRules(variant)),
    clock: clock ? { initial: clock.initial, increment: clock.increment } : undefined,
    createdAt,
  };

  return game;
}

function normalizeLichessPlayer(player: GamePlayerUser) {
  if (player.aiLevel !== undefined) {
    return {
      name: `Stockfish (Level ${player.aiLevel})`,
    };
  } else {
    return {
      name: player.user.name,
      rating: player.rating,
      ratingDiff: player.ratingDiff,
    };
  }
}

const CHESSDOTCOM_DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

export function normalizeChessDotComGame(chessDotComGame: ChessDotComGame): ChessGame {
  const { uuid, white, black, initial_setup, end_time, time_control, time_class, rules, fen } = chessDotComGame;
  const parsedGame = parsePgn(chessDotComGame.pgn)[0];
  const moves: string[] = [];
  for (const node of parsedGame.moves.mainline()) {
    moves.push(node.san);
  }
  const initialFen = initial_setup || undefined;

  return {
    id: uuid,
    players: {
      white: {
        name: white.username,
        rating: white.rating,
      },
      black: {
        name: black.username,
        rating: black.rating,
      },
    },
    opening: {
      name: parsedGame.headers.get("ECOUrl")?.split("/").pop() ?? "",
    },
    variant: rules,
    speed: time_class,
    result: getChessDotComResult(white.result, black.result),
    initialFen,
    moves: getMoveStringFromSan(moves, initialFen),
    plyCount: moves.length,
    // Moves of other variants do not replay on a standard board, so those keep the final fen without a last move.
    finalPosition: rules === "chess" || rules === "chess960" ? getFinalPosition(moves, initialFen) : { fen },
    clock: parseChessDotComTimeControl(time_control),
    createdAt: end_time * 1000,
  };
}

function getChessDotComResult(whiteResult: string, blackResult: string): GameResult | undefined {
  if (whiteResult === "win") return "white";
  if (blackResult === "win") return "black";
  if (CHESSDOTCOM_DRAW_RESULTS.has(whiteResult)) return "draw";
  return undefined;
}

// Live games use "180+2" or "600"; daily games use "1/259200" (moves per seconds), which has no clock.
function parseChessDotComTimeControl(timeControl: string): ChessGame["clock"] {
  if (timeControl.includes("/")) return undefined;
  const [initial, increment = "0"] = timeControl.split("+");
  return { initial: Number.parseInt(initial), increment: Number.parseInt(increment) };
}

export function getPlayerColor(game: ChessGame, username: string): GameColor | undefined {
  const name = username.toLowerCase();
  if (!name) return undefined;
  if (game.players.white.name.toLowerCase() === name) return "white";
  if (game.players.black.name.toLowerCase() === name) return "black";
  return undefined;
}
