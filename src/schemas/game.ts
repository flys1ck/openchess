import { colors, files, ranks } from "chessground/types";
import { z } from "zod";

const squares = files.reduce<string[]>((acc, file) => {
  ranks.forEach((rank) => acc.push(file + rank));
  return acc;
}, []) as [string, ...string[]];

export const ProcessMoveSchema = z
  .object({
    fen: z.string(),
    turnColor: z.enum(colors),
    possibleMoves: z.record(z.array(z.enum(squares))),
    isCheck: z.boolean(),
  })
  .strict();

export const ParsePgnSchema = z.array(
  z
    .object({
      ply: z.number(),
      comment: z.string().nullable(),
      fen: z.string(),
      chessMove: z
        .object({
          source: z.string(),
          destination: z.string(),
          piece: z.object({
            color: z.union([z.literal("black"), z.literal("white")]),
            role: z.string(),
          }),
          isCheck: z.boolean(),
          isCapture: z.boolean(),
        })
        .nullable(),
      possibleMoves: z
        .record(z.array(z.enum(squares)))
        .transform((possibleMoves) => new Map(Object.entries(possibleMoves))),
    })
    .strict()
);
