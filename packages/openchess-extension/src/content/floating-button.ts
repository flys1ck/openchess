import { OPEN_IN_OPENCHESS_MESSAGE } from "../shared/messages";
import { getFinishedChessDotComGameId } from "./chessdotcom";
import { getFinishedLichessGameId } from "./lichess";
import styles from "./floating-button.css?inline";

const HOST_ID = "openchess-floating-button-host";

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
].join(" ");

export function mountFloatingButton(): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASSES;
  button.textContent = "Analyze in OpenChess";

  button.addEventListener("click", () => {
    void openCurrentGameInOpenChess();
  });

  shadow.append(style, button);
  document.body.append(host);
}

async function openCurrentGameInOpenChess(): Promise<void> {
  const lichessGameId = getFinishedLichessGameId();
  if (lichessGameId) {
    void chrome.runtime.sendMessage({
      type: OPEN_IN_OPENCHESS_MESSAGE,
      provider: "lichess",
      gameId: lichessGameId,
    });
    return;
  }

  const chessDotComGameId = await getFinishedChessDotComGameId();
  if (!chessDotComGameId) {
    return;
  }

  void chrome.runtime.sendMessage({
    type: OPEN_IN_OPENCHESS_MESSAGE,
    provider: "chessdotcom",
    gameId: chessDotComGameId,
  });
}
