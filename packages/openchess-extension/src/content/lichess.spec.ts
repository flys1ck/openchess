import { describe, expect, it } from "vitest";
import { extractLichessGameId } from "./lichess";

describe("extractLichessGameId", () => {
  it("should read the 8-character id from a game path", () => {
    expect(extractLichessGameId("/9SZSSje9")).toBe("9SZSSje9");
    expect(extractLichessGameId("/9SZSSje9/")).toBe("9SZSSje9");
  });

  it("should ignore a 4-character player seat suffix", () => {
    expect(extractLichessGameId("/9SZSSje9abcd")).toBe("9SZSSje9");
  });

  it("should allow color and analysis suffixes", () => {
    expect(extractLichessGameId("/9SZSSje9/white")).toBe("9SZSSje9");
    expect(extractLichessGameId("/9SZSSje9/black")).toBe("9SZSSje9");
    expect(extractLichessGameId("/9SZSSje9/analysis")).toBe("9SZSSje9");
    expect(extractLichessGameId("/9SZSSje9/white/analysis")).toBe("9SZSSje9");
    expect(extractLichessGameId("/9SZSSje9abcd/black/analysis/")).toBe("9SZSSje9");
  });

  it("should return null for paths that are not Lichess games", () => {
    expect(extractLichessGameId("/")).toBeNull();
    expect(extractLichessGameId("/@/alice")).toBeNull();
    expect(extractLichessGameId("/9SZSSje")).toBeNull();
    expect(extractLichessGameId("/9SZSSje9/extra")).toBeNull();
    expect(extractLichessGameId("/tv")).toBeNull();
  });
});
