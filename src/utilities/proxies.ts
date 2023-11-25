import { ChessDotComGame } from "@/services/chessdotcom";
import { LichessGame } from "@/services/lichess";
import { ChessGame } from "@/types/ChessGame";
import { getMoveStringFromSan } from "@/utilities/moves";
import { parsePgn } from "chessops/pgn";

export function normalizeLichessGame(lichessGame: LichessGame): ChessGame {
  const { id, players, opening, variant, moves, initialFen, clock, createdAt } = lichessGame;
  const white = normalizeLichessPlayer(players.white);
  const black = normalizeLichessPlayer(players.black);
  const game: ChessGame = {
    id,
    players: { white, black },
    opening: opening ? { name: opening.name } : undefined,
    variant,
    moves: moves ?? "",
    initialFen,
    clock: clock ? { initial: clock.initial, increment: clock.increment } : undefined,
    createdAt,
  };

  return game;
}

function normalizeLichessPlayer(player: LichessGame["players"]["white"] | LichessGame["players"]["black"]) {
  if ("aiLevel" in player) {
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

export function normalizeChessDotComGame(chessDotComGame: ChessDotComGame): ChessGame {
  const { uuid, white, black, initial_setup, end_time, time_control, rules } = chessDotComGame;
  const timeControl = time_control.split("+");
  const parsedGame = parsePgn(chessDotComGame.pgn)[0];
  const moves: string[] = [];
  for (const node of parsedGame.moves.mainline()) {
    moves.push(node.san);
  }

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
    initialFen: initial_setup,
    moves: getMoveStringFromSan(moves, initial_setup),
    clock: {
      initial: Number.parseInt(timeControl[0]),
      increment: Number.parseInt(timeControl[1]),
    },
    createdAt: end_time * 1000,
  };
}
