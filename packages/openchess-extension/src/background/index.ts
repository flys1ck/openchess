import { isOpenInOpenChessMessage, type OpenChessGameProvider } from "../shared/messages";

const OPENCHESS_SCHEME = "com.openchess.dev";

function buildOpenChessDeepLink(provider: OpenChessGameProvider, gameId: string): string {
  return `${OPENCHESS_SCHEME}://games/${provider}?id=${encodeURIComponent(gameId)}`;
}

chrome.runtime.onInstalled.addListener(() => {
  console.warn("[OpenChess] extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isOpenInOpenChessMessage(message)) {
    return false;
  }

  const url = buildOpenChessDeepLink(message.provider, message.gameId);

  chrome.tabs
    .update({ url })
    .then(() => sendResponse({ ok: true }))
    .catch((error: unknown) => {
      console.error("[OpenChess] failed to open deep link", error);
      sendResponse({ ok: false });
    });

  return true;
});
