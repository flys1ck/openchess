/**
 * Matches `/gameId`, `/gameIdXXXX` (player seat), and optional `/white|black|/analysis` suffixes.
 */
const LICHESS_GAME_PATH = /^\/([a-zA-Z0-9]{8})([a-zA-Z0-9]{4})?(?:\/(?:white|black))?(?:\/analysis)?\/?$/;

export function extractLichessGameId(pathname: string): string | null {
  const match = pathname.match(LICHESS_GAME_PATH);
  return match?.[1] ?? null;
}

/**
 * Finished games expose a result in both round and analysis views: - SSR / sidebar: `section.status` (e.g. "Checkmate •
 * White is victorious") - Round (hydrated): `.result-wrap` / `p.result` - Analysis (hydrated): `div.result`
 */
export function isLichessGameFinished(doc: Document = document): boolean {
  return Boolean(doc.querySelector("section.status, .result-wrap, p.result, div.result"));
}

/**
 * Returns the 8-char game id when the current page is a finished Lichess game.
 */
export function getFinishedLichessGameId(
  locationLike: Pick<Location, "hostname" | "pathname"> = location,
  doc: Document = document
): string | null {
  if (!/(^|\.)lichess\.org$/i.test(locationLike.hostname)) {
    return null;
  }

  const gameId = extractLichessGameId(locationLike.pathname);
  if (!gameId || !isLichessGameFinished(doc)) {
    return null;
  }

  return gameId;
}
