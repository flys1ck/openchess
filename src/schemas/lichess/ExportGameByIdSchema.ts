import { z } from "zod";

const GAME_VARIANTS = [
  "standard",
  "chess960",
  "crazyhouse",
  "antichess",
  "atomic",
  "horde",
  "kingOfTheHill",
  "racingKings",
  "threeCheck",
  "fromPosition",
] as const;

const GAME_SPEEDS = ["ultraBullet", "bullet", "blitz", "rapid", "classical", "correspondence"] as const;

const PLAYER_TITLES = ["GM", "WGM", "IM", "WIM", "FM", "WFM", "NM", "CM", "WCM", "WNM", "LM", "BOT"] as const;

const GAME_STATUSES = [
  "created",
  "started",
  "aborted",
  "mate",
  "resign",
  "stalemate",
  "timeout",
  "draw",
  "outoftime",
  "cheat",
  "noStart",
  "unknownFinish",
  "variantEnd",
] as const;

const LightUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    title: z.enum(PLAYER_TITLES).optional(),
    patron: z.boolean().optional(),
  });

const PlayerAnalysisSchema = z
  .object({
    inaccuracy: z.number(),
    mistake: z.number(),
    blunder: z.number(),
    acpl: z.number(),
  });

export const PlayerSchema = z.union([
  z.strictObject({
    user: LightUserSchema,
    rating: z.number().optional(),
    ratingDiff: z.number().optional(),
    name: z.string().optional(),
    provisional: z.boolean().optional(),
    aiLevel: z.number().optional(),
    analysis: PlayerAnalysisSchema.optional(),
    team: z.string().optional(),
  }),
  z.strictObject({
    aiLevel: z.number(),
  }),
]);

const OpeningSchema = z.object({
  eco: z.string(),
  name: z.string(),
  ply: z.number(),
});

const AnalysisJudgementSchema = z
  .object({
    name: z.enum(["Inaccuracy", "Mistake", "Blunder"]),
    comment: z.string(),
  });

const AnalysisObjectSchema = z
  .object({
    eval: z.number(),
    best: z.string().optional(),
    variation: z.string().optional(),
    judgment: AnalysisJudgementSchema.optional(),
  });

const GameClockSchema = z
  .object({
    initial: z.number(),
    increment: z.number(),
    totalTime: z.number(),
  });

const GameSchema = z
  .object({
    id: z.string(),
    rated: z.boolean(),
    variant: z.enum(GAME_VARIANTS),
    speed: z.enum(GAME_SPEEDS),
    perf: z.string(),
    createdAt: z.number(),
    lastMoveAt: z.number(),
    status: z.enum(GAME_STATUSES),
    players: z
      .object({
        white: PlayerSchema,
        black: PlayerSchema,
      }),
    initialFen: z.string().optional(),
    winner: z.enum(["white", "black"]).optional(),
    opening: OpeningSchema.optional(),
    moves: z.string().optional(),
    pgn: z.string().optional(),
    daysPerTurn: z.number().optional(),
    analysis: z.array(AnalysisObjectSchema).optional(),
    tournament: z.string().optional(),
    swiss: z.string().optional(),
    clock: GameClockSchema.optional(),
  });

export default GameSchema;
