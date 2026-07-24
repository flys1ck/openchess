import { fetch } from "@tauri-apps/plugin-http";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { defaultSetup } from "chessops/setup";
import { decodeTcn, tcnToPgn } from "../utilities/tcn";

export interface ChessDotComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  accuracies: { white: number; black: number };
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: {
    rating: number;
    result: string;
    "@id": string;
    username: string;
    uuid: string;
  };
  black: {
    rating: number;
    result: string;
    "@id": string;
    username: string;
    uuid: string;
  };
}

interface ChessDotComCallbackPlayer {
  uuid: string;
  color: string;
  rating: number;
  username: string;
  "@id"?: string;
}

interface ChessDotComCallbackGame {
  game: {
    id: number;
    uuid: string;
    initialSetup: string;
    isRated: boolean;
    moveList: string;
    colorOfWinner?: string | null;
    gameEndReason?: string;
    endTime: number;
    type: string;
    pgnHeaders: Record<string, string | number>;
  };
  players: {
    top: ChessDotComCallbackPlayer;
    bottom: ChessDotComCallbackPlayer;
  };
}

export function ChessDotComClient() {
  let recentGames: ChessDotComGame[] = [];
  let recentGamesEtag: string | null = null;

  async function getPlayer(username: string) {
    const url = `https://api.chess.com/pub/player/${username}`;
    const response = await fetch(url);
    return await response.json();
  }

  async function getRecentGamesByPlayer(username: string) {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const url = `https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${month}`;
    const headers = recentGamesEtag ? new Headers({ "If-None-Match": recentGamesEtag }) : new Headers({});
    const response = await fetch(url, { headers });
    if (response.status === 304) return recentGames;
    const data = (await response.json()) as { games: ChessDotComGame[] };
    const sortedGames = data.games.sort((a, b) => b.end_time - a.end_time);

    recentGamesEtag = response.headers.get("etag");
    recentGames = sortedGames;
    return sortedGames;
  }

  async function getGameByUuid(uuid: string) {
    const cached = recentGames.find((game) => game.uuid === uuid);
    if (cached) return cached;

    const response = await fetch(`https://www.chess.com/callback/live/game/${uuid}`);
    if (!response.ok) return null;

    const data = (await response.json()) as ChessDotComCallbackGame;
    if (!data.game) return null;

    const game = mapCallbackGame(data);
    recentGames = [game, ...recentGames];
    return game;
  }

  return { getPlayer, getRecentGamesByPlayer, getGameByUuid };
}

function mapCallbackGame({ game, players }: ChessDotComCallbackGame): ChessDotComGame {
  const whitePlayer = players.top.color === "white" ? players.top : players.bottom;
  const blackPlayer = players.top.color === "black" ? players.top : players.bottom;
  const initialSetup =
    game.initialSetup ||
    (typeof game.pgnHeaders.FEN === "string" ? game.pgnHeaders.FEN : "") ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const moves = decodeTcn(game.moveList);
  const pgn = tcnToPgn(game.moveList, game.pgnHeaders, initialSetup);
  const setup = initialSetup.trim() ? parseFen(initialSetup.trim()).unwrap() : defaultSetup();
  const position = Chess.fromSetup(setup).unwrap();
  for (const move of moves) {
    position.play(move);
  }

  return {
    url: `https://www.chess.com/game/live/${game.id}`,
    pgn,
    time_control: String(game.pgnHeaders.TimeControl ?? ""),
    end_time: game.endTime,
    rated: game.isRated,
    accuracies: { white: 0, black: 0 },
    tcn: game.moveList,
    uuid: game.uuid,
    initial_setup: initialSetup,
    fen: makeFen(position.toSetup()),
    time_class: "",
    rules: game.type,
    white: {
      rating: whitePlayer.rating,
      result: resultFor("white", game.colorOfWinner, game.gameEndReason, String(game.pgnHeaders.Result ?? "")),
      "@id": whitePlayer["@id"] ?? `https://api.chess.com/pub/player/${whitePlayer.username.toLowerCase()}`,
      username: whitePlayer.username,
      uuid: whitePlayer.uuid,
    },
    black: {
      rating: blackPlayer.rating,
      result: resultFor("black", game.colorOfWinner, game.gameEndReason, String(game.pgnHeaders.Result ?? "")),
      "@id": blackPlayer["@id"] ?? `https://api.chess.com/pub/player/${blackPlayer.username.toLowerCase()}`,
      username: blackPlayer.username,
      uuid: blackPlayer.uuid,
    },
  };
}

function resultFor(
  color: "white" | "black",
  winner: string | null | undefined,
  endReason: string | undefined,
  headersResult: string
): string {
  if (headersResult === "1/2-1/2" || !winner) return "agreed";
  if (winner === color) return "win";
  return endReason || "lose";
}
