import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChessDotComClient, type ChessDotComGame } from "./chessdotcom";

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
    vi.unstubAllGlobals();
  });

  describe("getRecentGamesByPlayer", () => {
    it("should construct URL with zero-padded month", async () => {
      const mockResponse = new Response(new Blob([JSON.stringify({ games: [] })]), {
        status: 200,
        headers: new Headers(),
      });
      const fetchMock = vi.fn<() => Promise<Response>>().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const client = ChessDotComClient();
      await client.getRecentGamesByPlayer("testuser");

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
      const fetchMock = vi.fn<() => Promise<Response>>().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

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
      const fetchMock = vi.fn<() => Promise<Response>>().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const client = ChessDotComClient();
      const games = await client.getRecentGamesByPlayer("testuser");

      expect(games[0].uuid).toBe("new");
      expect(games[1].uuid).toBe("old");
    });
  });

  describe("getGameByUuid", () => {
    it("should return the correct game by UUID after fetching", async () => {
      const target = gameFixture({ uuid: "target-uuid" });
      const other = gameFixture({ uuid: "other-uuid" });

      const mockResponse = new Response(new Blob([JSON.stringify({ games: [target, other] })]), {
        status: 200,
        headers: new Headers(),
      });
      const fetchMock = vi.fn<() => Promise<Response>>().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const client = ChessDotComClient();
      await client.getRecentGamesByPlayer("testuser");
      const result = await client.getGameByUuid("target-uuid");

      expect(result?.uuid).toBe("target-uuid");
    });

    it("should return null for an unknown UUID", async () => {
      const mockResponse = new Response(new Blob([JSON.stringify({ games: [] })]), {
        status: 200,
        headers: new Headers(),
      });
      const fetchMock = vi.fn<() => Promise<Response>>().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const client = ChessDotComClient();
      await client.getRecentGamesByPlayer("testuser");
      const result = await client.getGameByUuid("nonexistent");

      expect(result).toBeNull();
    });
  });
});
