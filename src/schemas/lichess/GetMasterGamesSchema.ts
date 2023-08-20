import { z } from "zod";

const Game = z.object({
  id: z.string(),
  winner: z.enum(["white", "black"]).nullable(),
  black: z.object({
    name: z.string(),
    rating: z.number(),
  }),
  white: z.object({
    name: z.string(),
    rating: z.number(),
  }),
  year: z.number(),
  month: z.string().nullable(),
});

const Move = z.object({
  uci: z.string(),
  san: z.string(),
  averageRating: z.number(),
  white: z.number(),
  draws: z.number(),
  black: z.number(),
  game: Game.nullable(),
});

const TopGame = z.object({
  uci: z.string(),
  id: z.string(),
  winner: z.enum(["white", "black"]).nullable(),
  black: z.object({
    name: z.string(),
    rating: z.number(),
  }),
  white: z.object({
    name: z.string(),
    rating: z.number(),
  }),
  year: z.number(),
  month: z.string().nullable(),
});

const Opening = z.union([
  z.object({
    eco: z.string(),
    name: z.string(),
  }),
  z.null(),
]);

const MasterGamesSchema = z.object({
  white: z.number(),
  draws: z.number(),
  black: z.number(),
  moves: z.array(Move),
  topGames: z.array(TopGame),
  opening: Opening,
});

export default MasterGamesSchema;
