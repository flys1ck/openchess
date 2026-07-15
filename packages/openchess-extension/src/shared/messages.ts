export const OPEN_IN_OPENCHESS_MESSAGE = "open-in-openchess" as const;

export type OpenChessGameProvider = "lichess" | "chessdotcom";

export type OpenInOpenChessMessage = {
  type: typeof OPEN_IN_OPENCHESS_MESSAGE;
  provider: OpenChessGameProvider;
  gameId: string;
};

export function isOpenInOpenChessMessage(message: unknown): message is OpenInOpenChessMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === OPEN_IN_OPENCHESS_MESSAGE &&
    "provider" in message &&
    (message.provider === "lichess" || message.provider === "chessdotcom") &&
    "gameId" in message &&
    typeof message.gameId === "string" &&
    message.gameId.length > 0
  );
}
