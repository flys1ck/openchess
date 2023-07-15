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

/**
 * @see https://lichess.org/api#tag/Games/operation/apiGamesUser
 */
export async function exportGamesByUser(username: string, queryParameters: ExportGamesByUserQueryParameters) {
  // @ts-ignore URLSearchParams can handle numbers in Records
  const params = new URLSearchParams(queryParameters).toString();

  const response = await fetch(`https://lichess.org/api/games/user/${username}?${params}`);
  return await response.text();
}
