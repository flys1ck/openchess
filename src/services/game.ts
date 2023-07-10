import { PromotionPiece } from "@composables/useGame";
import { ParsePgnSchema, ProcessMoveSchema } from "@schemas/game";
import { invoke } from "@tauri-apps/api";
import { Key } from "chessground/types";

export async function getNextMove(
  fen: string,
  source: Key,
  destination: Key,
  promotionPiece: PromotionPiece | undefined
) {
  const response = await invoke("get_next_move", {
    fen,
    source,
    destination,
    promotionPiece: promotionPiece ?? "",
  });

  const parsedResponse = ProcessMoveSchema.safeParse(response);
  if (!parsedResponse.success) throw new Error(`Invalid response ${parsedResponse.error}`);

  return parsedResponse.data;
}

export async function parsePgn(pgn: string) {
  const response = await invoke("parse_pgn", { pgn });

  const parsedResponse = ParsePgnSchema.safeParse(response);
  if (!parsedResponse.success) throw new Error(`Invalid response ${parsedResponse.error}`);

  return parsedResponse.data;
}
