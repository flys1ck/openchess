import styles from "./floating-button.css?inline";

const HOST_ID = "openchess-floating-button-host";
const OPENCHESS_SCHEME = "com.openchess.dev";

type OpenChessGameProvider = "lichess" | "chessdotcom";

const BUTTON_CLASSES = [
  "fixed",
  "right-5",
  "top-20",
  "flex",
  "items-center",
  "justify-center",
  "rounded-sm",
  "border-none",
  "bg-orange-500",
  "p-2",
  "text-white",
  "hover:bg-orange-600",
  "cursor-pointer",
  "z-50",
].join(" ");

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
  button.className = BUTTON_CLASSES;
  button.textContent = "Analyze in OpenChess";

  button.addEventListener("click", openCurrentGameInOpenChess);

  shadow.append(style, button);
  document.body.append(host);
}

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

function getCurrentGame(
  locationLike: Pick<Location, "hostname" | "pathname"> = location
): { provider: OpenChessGameProvider; gameId: string } | null {
  // Matches `/gameId`, `/gameIdXXXX` (player seat), and optional `/white|black|/analysis` suffixes.
  const LICHESS_GAME_PATH = /^\/([a-zA-Z0-9]{8})([a-zA-Z0-9]{4})?(?:\/(?:white|black))?(?:\/analysis)?\/?$/;
  if (/(^|\.)lichess\.org$/i.test(locationLike.hostname)) {
    const gameId = locationLike.pathname.match(LICHESS_GAME_PATH)?.[1];
    return gameId ? { provider: "lichess", gameId } : null;
  }

  // Matches `/game/live/{numericId}` and `/analysis/game/live/{numericId}` with optional trailing path.
  const CHESSCOM_LIVE_GAME_PATH = /^\/(?:analysis\/)?game\/live\/(\d+)(?:\/.*)?\/?$/;
  if (/(^|\.)chess\.com$/i.test(locationLike.hostname)) {
    const gameId = locationLike.pathname.match(CHESSCOM_LIVE_GAME_PATH)?.[1];
    return gameId ? { provider: "chessdotcom", gameId } : null;
  }

  return null;
}
