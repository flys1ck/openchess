import { describe, expect, it } from "vitest";
import { parseLichessGamesNdjson } from "./lichessGames";

describe("parseLichessGamesNdjson", () => {
  it("returns an empty list for empty text", () => {
    expect(parseLichessGamesNdjson("")).toEqual([]);
  });

  it("parses a JSON array of games", () => {
    const games = [{ id: "abc" }, { id: "def" }];

    expect(parseLichessGamesNdjson(JSON.stringify(games))).toEqual(games);
  });

  it("parses NDJSON games and ignores blank lines", () => {
    const first = { id: "abc" };
    const second = { id: "def" };
    const text = `${JSON.stringify(first)}\n\n${JSON.stringify(second)}\n`;

    expect(parseLichessGamesNdjson(text)).toEqual([first, second]);
  });
});
