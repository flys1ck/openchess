/**
 * Matches `/game/{numericId}` (active), `/game/live/{numericId}` (finished "live" chess), and
 * `/analysis/game/(live/)?{numericId}` with optional trailing path.
 */
const CHESSCOM_LIVE_GAME_PATH = /^\/(?:analysis\/)?game\/(?:live\/)?(\d+)(?:\/.*)?\/?$/;

/**
 * Finished-game UI shown by Chess.com. The analysis link is language-independent; the aria label and legacy modal are
 * fallbacks for alternate and older layouts.
 */
const CHESSCOM_FINISHED_SELECTOR = [
  '.game-review-buttons-component a[href*="/analysis/game/"]',
  '.game-review-buttons-component a[aria-label="Game Review"]',
  ".game-over-modal-shell-container",
].join(", ");

/**
 * Returns the live game id from a Chess.com game or analysis pathname, or null if it does not match.
 */
export function extractChessDotComLiveGameId(pathname: string): string | null {
  return pathname.match(CHESSCOM_LIVE_GAME_PATH)?.[1] ?? null;
}

/**
 * Returns true when the page is a finished Chess.com game: analysis URLs are always finished; otherwise looks for the
 * sidebar Game Review button (`/game/{id}` while playing, `/game/live/{id}` after).
 */
export function isChessDotComGameFinished(
  doc: Document = document,
  locationLike: Pick<Location, "pathname"> = location
): boolean {
  if (/^\/analysis\/game\/(?:live\/)?\d+/i.test(locationLike.pathname)) return true;

  return Boolean(doc.querySelector(CHESSCOM_FINISHED_SELECTOR));
}
