import { extractChessDotComLiveGameId, isChessDotComGameFinished } from "./chessdotcom";
import { extractLichessGameId, isLichessGameFinished } from "./lichess";
import styles from "./floating-button.css?inline";

const HOST_ID = "openchess-floating-button-host";
const HIDDEN_CLASS = "openchess-floating-button-hidden";
const OPENCHESS_SCHEME = "com.openchess.dev";
const SYNC_INTERVAL_MS = 1000;

type OpenChessGameProvider = "lichess" | "chessdotcom";

type CurrentGame = {
  provider: OpenChessGameProvider;
  gameId: string;
  isAnalysis: boolean;
};

let syncIntervalId: number | null = null;

/**
 * Shows the floating button on game analysis pages and active game pages whose finished-game marker is present.
 */
export function syncFloatingButton(): void {
  const game = getCurrentGame();

  if (!game) {
    hideFloatingButton();
    return;
  }

  if (game.isAnalysis || isGameFinished(game)) {
    showFloatingButton();
  } else {
    hideFloatingButton();
  }
}

/**
 * Runs an immediate sync, then polls the current game state. No-ops if already started.
 */
export function startFloatingButtonSync(): void {
  if (syncIntervalId !== null) return;

  syncFloatingButton();
  syncIntervalId = window.setInterval(syncFloatingButton, SYNC_INTERVAL_MS);
}

/**
 * Stops polling.
 */
export function stopFloatingButtonSync(): void {
  if (syncIntervalId === null) return;
  window.clearInterval(syncIntervalId);
  syncIntervalId = null;
}

/**
 * Creates or fades in the liquid blob "Analyze in OpenChess" button.
 */
export function showFloatingButton(): void {
  const existingHost = document.getElementById(HOST_ID);
  if (existingHost) {
    existingHost.classList.remove(HIDDEN_CLASS);
    return;
  }

  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "openchess-floating-button";
  button.setAttribute("aria-label", "Analyze in OpenChess");
  button.addEventListener("click", openCurrentGameInOpenChess);

  const label = document.createElement("span");
  label.className = "openchess-floating-button-label";
  label.textContent = "Analyze in OpenChess";
  label.setAttribute("aria-hidden", "true");

  shadow.append(style, button, label);
  document.body.append(host);
}

/**
 * Fades out the floating button if present.
 */
export function hideFloatingButton(): void {
  document.getElementById(HOST_ID)?.classList.add(HIDDEN_CLASS);
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
 * Returns true when an active game's provider-specific finished marker is present.
 */
function isGameFinished(game: CurrentGame): boolean {
  return game.provider === "lichess" ? isLichessGameFinished(document) : isChessDotComGameFinished(document, location);
}

/**
 * Returns provider + game id for the current Lichess or Chess.com URL, or null when not on a supported game page.
 */
function getCurrentGame(locationLike: Pick<Location, "hostname" | "pathname"> = location): CurrentGame | null {
  if (/(^|\.)lichess\.org$/i.test(locationLike.hostname)) {
    const gameId = extractLichessGameId(locationLike.pathname);
    return gameId
      ? {
          provider: "lichess",
          gameId,
          isAnalysis: /\/analysis\/?$/i.test(locationLike.pathname),
        }
      : null;
  }

  if (/(^|\.)chess\.com$/i.test(locationLike.hostname)) {
    const gameId = extractChessDotComLiveGameId(locationLike.pathname);
    return gameId
      ? {
          provider: "chessdotcom",
          gameId,
          isAnalysis: /^\/analysis\/game\//i.test(locationLike.pathname),
        }
      : null;
  }

  return null;
}
