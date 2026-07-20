/**
 * Matches `/game/{numericId}` (active), `/game/live/{numericId}` (finished "live" chess), and
 * `/analysis/game/(live/)?{numericId}` with optional trailing path.
 */
const CHESSCOM_LIVE_GAME_PATH = /^\/(?:analysis\/)?game\/(?:live\/)?(\d+)(?:\/.*)?\/?$/;

/**
 * End-of-game modal container shown when a Chess.com live game is finished.
 */
const CHESSCOM_FINISHED_SELECTOR = ".game-over-modal-shell-container";

/**
 * Returns the live game id from a Chess.com game or analysis pathname, or null if it does not match.
 */
export function extractChessDotComLiveGameId(pathname: string): string | null {
  return pathname.match(CHESSCOM_LIVE_GAME_PATH)?.[1] ?? null;
}

/**
 * Returns true when the page is a finished Chess.com game: analysis URLs are always finished; otherwise looks for the
 * end-of-game modal in the DOM (`/game/{id}` while playing, `/game/live/{id}` after).
 */
export function isChessDotComGameFinished(
  doc: Document = document,
  locationLike: Pick<Location, "pathname"> = location
): boolean {
  if (/^\/analysis\/game\/(?:live\/)?\d+/i.test(locationLike.pathname)) return true;

  return Boolean(doc.querySelector(CHESSCOM_FINISHED_SELECTOR));
}

/**
 * Returns the live game id when on chess.com and the current live game is finished; otherwise null.
 */
export function getFinishedChessDotComGameId(
  locationLike: Pick<Location, "hostname" | "pathname"> = location,
  doc: Document = document
): string | null {
  if (!/(^|\.)chess\.com$/i.test(locationLike.hostname)) return null;

  const liveGameId = extractChessDotComLiveGameId(locationLike.pathname);
  if (!liveGameId || !isChessDotComGameFinished(doc, locationLike)) return null;

  return liveGameId;
}

/**
 * Resolves when the Chess.com game is finished (analysis URL or end-of-game modal). Resolves immediately if already
 * finished; resolves false if aborted or `document.body` is missing.
 */
export function waitForChessDotComGameFinished(doc: Document = document, signal?: AbortSignal): Promise<boolean> {
  if (isChessDotComGameFinished(doc)) return Promise.resolve(true);

  return new Promise((resolve) => {
    if (signal?.aborted || !doc.body) {
      resolve(false);
      return;
    }

    let settled = false;
    let observer: MutationObserver;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      resolve(false);
    };

    observer = new MutationObserver(() => {
      if (!isChessDotComGameFinished(doc)) return;
      cleanup();
      resolve(true);
    });

    signal?.addEventListener("abort", onAbort, { once: true });
    observer.observe(doc.body, { childList: true, subtree: true });
  });
}
