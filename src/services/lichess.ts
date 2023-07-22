type PerfType =
  | "ultraBullet"
  | "bullet"
  | "blitz"
  | "rapid"
  | "classical"
  | "correspondence"
  | "chess960"
  | "crazyhouse"
  | "antichess"
  | "atomic"
  | "horde"
  | "kingOfTheHill"
  | "racingKings"
  | "threeCheck";

interface ExportGamesByUserQueryParameters {
  since?: number;
  until?: number;
  max: number;
  vs?: string;
  rated?: boolean;
  perfType?: PerfType | string;
  color?: "white" | "black";
  analysed?: boolean;
  moves?: boolean;
  pgnInJson?: boolean;
  tags?: boolean;
  clocks?: boolean;
  evals?: boolean;
  accuracy?: boolean;
  opening?: boolean;
  ongoing?: boolean;
  finished?: boolean;
  literate?: boolean;
  lastFen?: boolean;
  players?: string;
  sort?: "dateAsc" | "dateDesc";
}

type AcceptHeader = "application/x-ndjson" | "application/x-chess-pgn";
interface LichessHeaders {
  accept: AcceptHeader;
}

/**
 * @see https://lichess.org/api#tag/Games/operation/apiGamesUser
 */
export async function exportGamesByUser(
  username: string,
  queryParameters?: ExportGamesByUserQueryParameters,
  headers: LichessHeaders = { accept: "application/x-chess-pgn" }
) {
  // @ts-ignore URLSearchParams can handle numbers in Records
  const params = new URLSearchParams(queryParameters).toString();

  const response = await fetch(`https://lichess.org/api/games/user/${username}?${params}`, {
    headers: {
      accept: headers.accept,
    },
  });

  // TODO: add schema
  if (headers.accept === "application/x-ndjson")
    return (await response.text())
      .trimEnd()
      .split("\n")
      .map((game) => JSON.parse(game));

  return await response.text();
}

interface ExportGameByIdQueryParameters {
  moves?: boolean;
  pgnInJson?: boolean;
  tags?: boolean;
  clocks?: boolean;
  evals?: boolean;
  accuracy?: boolean;
  opening?: boolean;
  literate?: boolean;
  players?: string;
}

export async function exportGameById(
  gameId: string,
  queryParameters?: ExportGameByIdQueryParameters,
  headers: LichessHeaders = { accept: "application/x-chess-pgn" }
) {
  // @ts-ignore URLSearchParams can handle numbers in Records
  const params = new URLSearchParams(queryParameters).toString();
  let url = `https://lichess.org/game/export/${gameId}`;
  if (params) url += `?${params}`;

  const response = await fetch(url, {
    headers: {
      accept: headers.accept,
    },
  });

  // TODO: add schema
  if (headers.accept === "application/x-ndjson")
    return (await response.text())
      .trimEnd()
      .split("\n")
      .map((game) => JSON.parse(game));

  return await response.text();
}
