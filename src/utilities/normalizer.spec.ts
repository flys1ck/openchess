import type { GameJson } from "@flys1ck/lichess-client";
import type { ChessDotComGame } from "@services/chessdotcom";
import { describe, expect, it } from "vitest";
import { getPlayerColor, normalizeChessDotComGame, normalizeLichessGame } from "./normalizer";

function lichessGameFixture(overrides: Partial<GameJson> = {}): GameJson {
  return {
    id: "abcd1234",
    rated: true,
    variant: "standard",
    speed: "blitz",
    perf: "blitz",
    createdAt: 1000,
    lastMoveAt: 2000,
    status: "resign",
    players: {
      white: { user: { id: "alice", name: "Alice" }, rating: 1500, ratingDiff: 6 },
      black: { user: { id: "bob", name: "Bob" }, rating: 1480, ratingDiff: -6 },
    },
    winner: "white",
    moves: "e4 e5 Nf3",
    clock: { initial: 300, increment: 3, totalTime: 420 },
    ...overrides,
  } as GameJson;
}

function chessDotComGameFixture(overrides: Partial<ChessDotComGame> = {}): ChessDotComGame {
  return {
    url: "https://www.chess.com/game/live/1",
    pgn: '[Event "Live Chess"]\n\n1. e4 e5 2. Nf3 *',
    time_control: "180+2",
    end_time: 1000,
    rated: true,
    accuracies: { white: 90, black: 85 },
    tcn: "",
    uuid: "uuid-1",
    initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    time_class: "blitz",
    rules: "chess",
    white: { rating: 1500, result: "win", "@id": "", username: "Alice", uuid: "p1" },
    black: { rating: 1480, result: "resigned", "@id": "", username: "Bob", uuid: "p2" },
    ...overrides,
  };
}

describe("normalizeLichessGame", () => {
  it("takes the result from the winner", () => {
    expect(normalizeLichessGame(lichessGameFixture()).result).toBe("white");
  });

  it("treats a finished game without a winner as a draw", () => {
    expect(normalizeLichessGame(lichessGameFixture({ winner: undefined, status: "stalemate" })).result).toBe("draw");
  });

  it("leaves aborted and ongoing games without a result", () => {
    expect(normalizeLichessGame(lichessGameFixture({ winner: undefined, status: "aborted" })).result).toBeUndefined();
    expect(normalizeLichessGame(lichessGameFixture({ winner: undefined, status: "started" })).result).toBeUndefined();
  });

  it("replays the moves to the final position", () => {
    const game = normalizeLichessGame(lichessGameFixture());
    expect(game.plyCount).toBe(3);
    expect(game.finalPosition).toEqual({
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      lastMove: ["g1", "f3"],
    });
  });
});

describe("normalizeChessDotComGame", () => {
  it("takes the result from the winning side", () => {
    expect(normalizeChessDotComGame(chessDotComGameFixture()).result).toBe("white");
    expect(
      normalizeChessDotComGame(
        chessDotComGameFixture({
          white: { rating: 1500, result: "timeout", "@id": "", username: "Alice", uuid: "p1" },
          black: { rating: 1480, result: "win", "@id": "", username: "Bob", uuid: "p2" },
        })
      ).result
    ).toBe("black");
  });

  it("recognises draws", () => {
    const game = normalizeChessDotComGame(
      chessDotComGameFixture({
        white: { rating: 1500, result: "repetition", "@id": "", username: "Alice", uuid: "p1" },
        black: { rating: 1480, result: "repetition", "@id": "", username: "Bob", uuid: "p2" },
      })
    );
    expect(game.result).toBe("draw");
  });

  it("parses time controls with and without increment", () => {
    expect(normalizeChessDotComGame(chessDotComGameFixture()).clock).toEqual({ initial: 180, increment: 2 });
    expect(normalizeChessDotComGame(chessDotComGameFixture({ time_control: "600" })).clock).toEqual({
      initial: 600,
      increment: 0,
    });
  });

  it("has no clock for daily games", () => {
    const game = normalizeChessDotComGame(chessDotComGameFixture({ time_control: "1/259200", time_class: "daily" }));
    expect(game.clock).toBeUndefined();
  });

  it("replays the moves to the final position", () => {
    expect(normalizeChessDotComGame(chessDotComGameFixture()).finalPosition).toEqual({
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      lastMove: ["g1", "f3"],
    });
  });

  it("uses the reported fen for variants that do not replay on a standard board", () => {
    const game = normalizeChessDotComGame(
      chessDotComGameFixture({ rules: "crazyhouse", fen: "8/8/8/8/8/8/8/K6k w - - 0 1" })
    );
    expect(game.finalPosition).toEqual({ fen: "8/8/8/8/8/8/8/K6k w - - 0 1" });
  });
});

describe("getPlayerColor", () => {
  const game = normalizeLichessGame(lichessGameFixture());

  it("matches the username case-insensitively", () => {
    expect(getPlayerColor(game, "alice")).toBe("white");
    expect(getPlayerColor(game, "BOB")).toBe("black");
  });

  it("returns undefined when the user did not play", () => {
    expect(getPlayerColor(game, "carol")).toBeUndefined();
    expect(getPlayerColor(game, "")).toBeUndefined();
  });
});
