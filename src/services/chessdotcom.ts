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

export function ChessDotComClient() {
  let recentGames: ChessDotComGame[] = [];
  let recentGamesEtag: string | null = null;

  async function getRecentGamesByUser(username: string) {
    const today = new Date();
    const url = `https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${today.getMonth() + 1}`;
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
    const game = recentGames.find((game) => game.uuid === uuid);
    if (!game) return null;

    return game;
  }

  return { getRecentGamesByUser, getGameByUuid };
}
