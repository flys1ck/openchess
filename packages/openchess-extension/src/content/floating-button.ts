import { extractChessDotComLiveGameId, waitForChessDotComGameFinished } from "./chessdotcom";
import { extractLichessGameId, waitForLichessGameFinished } from "./lichess";
import styles from "./floating-button.css?inline";

const HOST_ID = "openchess-floating-button-host";
const OPENCHESS_SCHEME = "com.openchess.dev";

type OpenChessGameProvider = "lichess" | "chessdotcom";

type CurrentGame = { provider: OpenChessGameProvider; gameId: string };

let waitController: AbortController | null = null;

/**
 * Waits until the current Lichess or Chess.com game is finished, then mounts the floating button. No-ops when the URL
 * is not a game page. Cancels any in-flight wait when called again.
 */
export async function mountFloatingButtonWhenFinished(): Promise<void> {
  waitController?.abort();
  waitController = new AbortController();
  const { signal } = waitController;

  const game = getCurrentGame();
  if (!game) return;

  const finished =
    game.provider === "lichess"
      ? await waitForLichessGameFinished(document, signal)
      : await waitForChessDotComGameFinished(document, signal);
  if (!finished || signal.aborted) return;

  // Bail if the user navigated to a different game while waiting.
  const current = getCurrentGame();
  if (!current || current.provider !== game.provider || current.gameId !== game.gameId) return;

  mountFloatingButton();
}

/**
 * Mounts the liquid blob "Analyze in OpenChess" button if it is not already present and the URL is a game page.
 */
export function mountFloatingButton(): void {
  if (document.getElementById(HOST_ID)) return;
  if (!getCurrentGame()) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "oc-blob";
  button.setAttribute("aria-label", "Analyze in OpenChess");
  button.addEventListener("click", openCurrentGameInOpenChess);

  shadow.append(style, button);
  document.body.append(host);
}

/**
 * Opens the current game in the OpenChess app via the `com.openchess.dev` deep link.
 */
function openCurrentGameInOpenChess(): void {
  const game = getCurrentGame();
  if (!game) return;

  const url = `${OPENCHESS_SCHEME}://games/${game.provider}?id=${encodeURIComponent(game.gameId)}`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Returns provider + game id for the current Lichess or Chess.com URL, or null when not on a supported game page.
 */
function getCurrentGame(locationLike: Pick<Location, "hostname" | "pathname"> = location): CurrentGame | null {
  if (/(^|\.)lichess\.org$/i.test(locationLike.hostname)) {
    const gameId = extractLichessGameId(locationLike.pathname);
    return gameId ? { provider: "lichess", gameId } : null;
  }

  if (/(^|\.)chess\.com$/i.test(locationLike.hostname)) {
    const gameId = extractChessDotComLiveGameId(locationLike.pathname);
    return gameId ? { provider: "chessdotcom", gameId } : null;
  }

  return null;
}
