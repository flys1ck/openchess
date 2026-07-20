import { describe, expect, it } from "vitest";
import { parseAppDeepLink } from "./deepLinks";

describe("parseAppDeepLink", () => {
  it("maps a finished Lichess game deep link to the game route", () => {
    expect(parseAppDeepLink("com.openchess.dev://games/lichess?id=9SZSSje9")).toBe("/games/lichess/9SZSSje9");
  });

  it("maps a finished Chess.com game deep link to the game route", () => {
    expect(parseAppDeepLink("com.openchess.dev://games/chessdotcom?id=171614746182")).toBe(
      "/games/chessdotcom/171614746182"
    );
  });

  it("ignores oauth callbacks", () => {
    expect(parseAppDeepLink("com.openchess.dev://oauth/callback?code=abc")).toBeNull();
  });

  it("ignores generic open links", () => {
    expect(parseAppDeepLink("com.openchess.dev://open")).toBeNull();
  });

  it("rejects game links without an id", () => {
    expect(parseAppDeepLink("com.openchess.dev://games/lichess")).toBeNull();
    expect(parseAppDeepLink("com.openchess.dev://games/chessdotcom")).toBeNull();
  });
});
