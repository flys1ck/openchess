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

/**
 * Returns the 8-char game id when on lichess.org and the current game is finished; otherwise null.
 */
export function getFinishedLichessGameId(
  locationLike: Pick<Location, "hostname" | "pathname"> = location,
  doc: Document = document
): string | null {
  if (!/(^|\.)lichess\.org$/i.test(locationLike.hostname)) return null;

  const gameId = extractLichessGameId(locationLike.pathname);
  if (!gameId || !isLichessGameFinished(doc)) return null;

  return gameId;
}

/**
 * Resolves when a finished-game result appears in the DOM. Resolves immediately if already finished; resolves false if
 * aborted or `document.body` is missing.
 */
export function waitForLichessGameFinished(doc: Document = document, signal?: AbortSignal): Promise<boolean> {
  if (isLichessGameFinished(doc)) return Promise.resolve(true);

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
      if (!isLichessGameFinished(doc)) return;
      cleanup();
      resolve(true);
    });

    signal?.addEventListener("abort", onAbort, { once: true });
    observer.observe(doc.body, { childList: true, subtree: true });
  });
}
