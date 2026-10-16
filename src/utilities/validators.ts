import { parseFen } from "chessops/fen";

export function isFEN(value: string) {
  return parseFen(value).isOk;
}
