import { describe, expect, it } from "vitest";
import { parseAppDeepLink, parseOAuthCallback } from "./deepLinks";

describe("parseOAuthCallback", () => {
  it("reads query params from a Lichess OAuth callback", () => {
    expect(parseOAuthCallback("com.skakia.app://oauth/callback?code=abc&state=xyz")?.get("code")).toBe("abc");
  });

  it("ignores game deep links", () => {
    expect(parseOAuthCallback("com.skakia.app://games/lichess?id=9SZSSje9")).toBeNull();
  });
});

describe("parseAppDeepLink", () => {
  it("maps a finished Lichess game deep link to the game route", () => {
    expect(parseAppDeepLink("com.skakia.app://games/lichess?id=9SZSSje9")).toBe("/games/lichess/9SZSSje9");
  });

  it("maps a finished Chess.com game deep link to the game route", () => {
    expect(parseAppDeepLink("com.skakia.app://games/chessdotcom?id=171614746182")).toBe(
      "/games/chessdotcom/171614746182"
    );
  });

  it("ignores oauth callbacks", () => {
    expect(parseAppDeepLink("com.skakia.app://oauth/callback?code=abc")).toBeNull();
  });

  it("ignores generic open links", () => {
    expect(parseAppDeepLink("com.skakia.app://open")).toBeNull();
  });

  it("rejects game links without an id", () => {
    expect(parseAppDeepLink("com.skakia.app://games/lichess")).toBeNull();
    expect(parseAppDeepLink("com.skakia.app://games/chessdotcom")).toBeNull();
  });
});
