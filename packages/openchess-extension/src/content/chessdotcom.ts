/**
 * Matches `/game/live/{numericId}` with an optional trailing slash.
 */
const CHESSCOM_LIVE_GAME_PATH = /^\/game\/live\/(\d+)\/?$/;

export function extractChessDotComLiveGameId(pathname: string): string | null {
  const match = pathname.match(CHESSCOM_LIVE_GAME_PATH);
  return match?.[1] ?? null;
}

type ChessDotComCallbackGame = {
  game?: {
    isFinished?: boolean;
  };
};

/**
 * Returns the live game id when the current page is a finished Chess.com live game.
 */
export async function getFinishedChessDotComGameId(
  locationLike: Pick<Location, "hostname" | "pathname"> = location
): Promise<string | null> {
  if (!/(^|\.)chess\.com$/i.test(locationLike.hostname)) {
    return null;
  }

  const liveGameId = extractChessDotComLiveGameId(locationLike.pathname);
  if (!liveGameId) {
    return null;
  }

  try {
    const response = await fetch(`https://www.chess.com/callback/live/game/${liveGameId}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ChessDotComCallbackGame;
    if (!data.game?.isFinished) {
      return null;
    }

    return liveGameId;
  } catch {
    return null;
  }
}
