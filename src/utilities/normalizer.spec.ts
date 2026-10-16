import { type GameJson } from "@flys1ck/lichess-client";
import { type ChessDotComGame } from "@services/chessdotcom";
import { describe, expect, it } from "vitest";
import { normalizeChessDotComGame, normalizeLichessGame } from "./normalizer";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function lichessGameFixture(overrides: Partial<GameJson> = {}): GameJson {
  return {
    id: "abcdefgh",
    rated: true,
    variant: "standard",
    speed: "blitz",
    perf: "blitz",
    createdAt: 1_700_000_000_000,
    lastMoveAt: 1_700_000_100_000,
    status: "resign",
    players: {
      white: {
        user: { id: "alice", name: "Alice" },
        rating: 1500,
        ratingDiff: 8,
      },
      black: {
        user: { id: "bob", name: "Bob" },
        rating: 1480,
        ratingDiff: -8,
      },
    },
    moves: "e4 e5 Nf3",
    ...overrides,
  };
}

function chessDotComGameFixture(overrides: Partial<ChessDotComGame> = {}): ChessDotComGame {
  return {
    url: "https://www.chess.com/game/live/1",
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "alice"]
[Black "bob"]
[Result "1-0"]
[ECOUrl "https://www.chess.com/openings/Kings-Pawn-Opening"]

1. e4 e5 2. Nf3 *`,
    time_control: "180+2",
    end_time: 1_700_000,
    rated: true,
    accuracies: { white: 90, black: 85 },
    tcn: "",
    uuid: "uuid-1",
    initial_setup: START_FEN,
    fen: START_FEN,
    time_class: "blitz",
    rules: "chess",
    white: { rating: 1500, result: "win", "@id": "", username: "alice", uuid: "p1" },
    black: { rating: 1480, result: "resigned", "@id": "", username: "bob", uuid: "p2" },
    ...overrides,
  };
}

describe("normalizeLichessGame", () => {
  it("should map players, moves, opening, and clock", () => {
    const game = normalizeLichessGame(
      lichessGameFixture({
        opening: { eco: "C44", name: "King's Pawn Game", ply: 3 },
        clock: { initial: 180, increment: 2, totalTime: 180 },
        initialFen: START_FEN,
      })
    );

    expect(game).toEqual({
      id: "abcdefgh",
      players: {
        white: { name: "Alice", rating: 1500, ratingDiff: 8 },
        black: { name: "Bob", rating: 1480, ratingDiff: -8 },
      },
      opening: { name: "King's Pawn Game" },
      variant: "standard",
      moves: "1.e4 e5 2.Nf3",
      initialFen: START_FEN,
      clock: { initial: 180, increment: 2 },
      createdAt: 1_700_000_000_000,
    });
  });

  it("should name Stockfish opponents from aiLevel", () => {
    const game = normalizeLichessGame(
      lichessGameFixture({
        players: {
          white: {
            user: { id: "alice", name: "Alice" },
            rating: 1500,
          },
          black: {
            user: { id: "lichess-ai", name: "Stockfish" },
            rating: 1500,
            aiLevel: 4,
          },
        },
      })
    );

    expect(game.players.white).toEqual({ name: "Alice", rating: 1500, ratingDiff: undefined });
    expect(game.players.black).toEqual({ name: "Stockfish (Level 4)" });
  });

  it("should omit opening and clock when they are missing", () => {
    const game = normalizeLichessGame(lichessGameFixture({ moves: undefined }));

    expect(game.opening).toBeUndefined();
    expect(game.clock).toBeUndefined();
    expect(game.initialFen).toBeUndefined();
    expect(game.moves).toBe("");
  });
});

describe("normalizeChessDotComGame", () => {
  it("should map players, SAN moves, opening slug, and clock", () => {
    const game = normalizeChessDotComGame(chessDotComGameFixture());

    expect(game).toEqual({
      id: "uuid-1",
      players: {
        white: { name: "alice", rating: 1500 },
        black: { name: "bob", rating: 1480 },
      },
      opening: { name: "Kings-Pawn-Opening" },
      variant: "chess",
      initialFen: START_FEN,
      moves: "1.e4 e5 2.Nf3",
      clock: { initial: 180, increment: 2 },
      createdAt: 1_700_000_000,
    });
  });

  it("should use an empty opening name when ECOUrl is missing", () => {
    const game = normalizeChessDotComGame(
      chessDotComGameFixture({
        pgn: `[Event "Live Chess"]
[White "alice"]
[Black "bob"]
[Result "*"]

1. d4 *`,
      })
    );

    expect(game.opening).toEqual({ name: "" });
    expect(game.moves).toBe("1.d4");
  });
});
