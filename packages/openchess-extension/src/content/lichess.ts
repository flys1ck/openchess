/**
 * Matches `/gameId`, `/gameIdXXXX` (player seat), and optional `/white|black|/analysis` suffixes.
 */
const LICHESS_GAME_PATH = /^\/([a-zA-Z0-9]{8})([a-zA-Z0-9]{4})?(?:\/(?:white|black))?(?:\/analysis)?\/?$/;

/**
 * Result markers for finished Lichess games: `section.status` (SSR/sidebar), `.result-wrap` / `p.result` (round),
 * `div.result` (analysis).
 */
const LICHESS_FINISHED_SELECTORS = "section.status, .result-wrap, p.result, div.result";

/**
 * Returns the 8-char Lichess game id from a pathname, or null if it does not match.
 */
export function extractLichessGameId(pathname: string): string | null {
  return pathname.match(LICHESS_GAME_PATH)?.[1] ?? null;
}

/**
 * Returns true when the document shows a finished-game result.
 */
export function isLichessGameFinished(doc: Document = document): boolean {
  return Boolean(doc.querySelector(LICHESS_FINISHED_SELECTORS));
}
