import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChessDotComClient, type ChessDotComGame } from "./chessdotcom";

const fetchMock = vi.fn<() => Promise<Response>>();

vi.mock("@tauri-apps/plugin-http", () => ({
  fetch: (...args: unknown[]) => fetchMock(...(args as [])),
}));

function gameFixture(overrides: Partial<ChessDotComGame> = {}): ChessDotComGame {
  return {
    url: "https://www.chess.com/game/live/1",
    pgn: "",
    time_control: "600",
    end_time: 1000,
    rated: true,
    accuracies: { white: 90, black: 85 },
    tcn: "",
    uuid: "uuid-1",
    initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    time_class: "rapid",
    rules: "chess",
    white: { rating: 1500, result: "win", "@id": "", username: "player1", uuid: "p1" },
    black: { rating: 1480, result: "resigned", "@id": "", username: "player2", uuid: "p2" },
    ...overrides,
  };
}

describe("ChessDotComClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe("getRecentGamesByPlayer", () => {
    it("should construct URL with zero-padded month", async () => {
      const mockResponse = new Response(new Blob([JSON.stringify({ games: [] })]), {
        status: 200,
        headers: new Headers(),
      });
      fetchMock.mockResolvedValue(mockResponse);

      const client = ChessDotComClient();

      vi.setSystemTime(new Date("2026-04-01T12:00:00Z"));
      await client.getRecentGamesByPlayer("testuser");
      vi.useRealTimers();

      expect(fetchMock).toHaveBeenCalledWith("https://api.chess.com/pub/player/testuser/games/2026/04", {
        headers: new Headers({}),
      });
    });

    it("should return games sorted by end_time descending", async () => {
      const older = gameFixture({ uuid: "old", end_time: 1000 });
      const newer = gameFixture({ uuid: "new", end_time: 2000 });

      const mockResponse = new Response(new Blob([JSON.stringify({ games: [older, newer] })]), {
        status: 200,
        headers: new Headers(),
      });
      fetchMock.mockResolvedValue(mockResponse);

      const client = ChessDotComClient();
      const games = await client.getRecentGamesByPlayer("testuser");

      expect(games[0].uuid).toBe("new");
      expect(games[1].uuid).toBe("old");
    });

    it("should handle 304 Not Modified and return cached games", async () => {
      const older = gameFixture({ uuid: "old", end_time: 1000 });
      const newer = gameFixture({ uuid: "new", end_time: 2000 });

      const mockResponse = new Response(new Blob([JSON.stringify({ games: [older, newer] })]), {
        status: 200,
        headers: new Headers(),
      });
      fetchMock.mockResolvedValue(mockResponse);

      const client = ChessDotComClient();
      const games = await client.getRecentGamesByPlayer("testuser");

      expect(games[0].uuid).toBe("new");
      expect(games[1].uuid).toBe("old");
    });
  });

  describe("getGameById", () => {
    it("should return the correct game by ID after fetching", async () => {
      const target = gameFixture({ uuid: "target-uuid" });
      const other = gameFixture({ uuid: "other-uuid" });

      const mockResponse = new Response(new Blob([JSON.stringify({ games: [target, other] })]), {
        status: 200,
        headers: new Headers(),
      });
      fetchMock.mockResolvedValue(mockResponse);

      const client = ChessDotComClient();
      await client.getRecentGamesByPlayer("testuser");
      const result = await client.getGameByUuid("target-uuid");

      expect(result?.uuid).toBe("target-uuid");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should fetch from the live callback when the game is not cached", async () => {
      const callbackResponse = {
        game: {
          id: 131867959787,
          uuid: "b1fbba96-de02-11ef-b596-6cfe544c0428",
          initialSetup: "",
          isRated: true,
          moveList: "lBYQkAZJ",
          colorOfWinner: "black",
          gameEndReason: "timeout",
          endTime: 1738129459,
          type: "chess",
          pgnHeaders: {
            Event: "Live Chess",
            Site: "Chess.com",
            Date: "2025.01.29",
            White: "KevinTheSnipe",
            Black: "Pguttah3000",
            Result: "0-1",
            TimeControl: "300",
            FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          },
        },
        players: {
          top: {
            uuid: "black-uuid",
            color: "black",
            rating: 1911,
            username: "Pguttah3000",
          },
          bottom: {
            uuid: "white-uuid",
            color: "white",
            rating: 1993,
            username: "KevinTheSnipe",
          },
        },
      };

      fetchMock.mockResolvedValue(new Response(new Blob([JSON.stringify(callbackResponse)]), { status: 200 }));

      const client = ChessDotComClient();
      const result = await client.getGameByUuid("b1fbba96-de02-11ef-b596-6cfe544c0428");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://www.chess.com/callback/live/game/b1fbba96-de02-11ef-b596-6cfe544c0428"
      );
      expect(result?.uuid).toBe("b1fbba96-de02-11ef-b596-6cfe544c0428");
      expect(result?.white.username).toBe("KevinTheSnipe");
      expect(result?.black.username).toBe("Pguttah3000");
      expect(result?.pgn).toContain("1. d4 c6 2. c4 d5");
    });

    it("should return null for an unknown ID", async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

      const client = ChessDotComClient();
      const result = await client.getGameByUuid("nonexistent");

      expect(fetchMock).toHaveBeenCalledWith("https://www.chess.com/callback/live/game/nonexistent");
      expect(result).toBeNull();
    });
  });
});
