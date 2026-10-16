import { describe, expect, it } from "vitest";
import { extractChessDotComLiveGameId } from "./chessdotcom";

describe("extractChessDotComLiveGameId", () => {
  it("should read the id from an active game path", () => {
    expect(extractChessDotComLiveGameId("/game/171614746182")).toBe("171614746182");
    expect(extractChessDotComLiveGameId("/game/171614746182/")).toBe("171614746182");
  });

  it("should read the id from a finished live game path", () => {
    expect(extractChessDotComLiveGameId("/game/live/171614746182")).toBe("171614746182");
    expect(extractChessDotComLiveGameId("/game/live/171614746182/chat")).toBe("171614746182");
  });

  it("should read the id from analysis paths", () => {
    expect(extractChessDotComLiveGameId("/analysis/game/171614746182")).toBe("171614746182");
    expect(extractChessDotComLiveGameId("/analysis/game/live/171614746182")).toBe("171614746182");
    expect(extractChessDotComLiveGameId("/analysis/game/live/171614746182/review")).toBe("171614746182");
  });

  it("should return null for paths that are not live games", () => {
    expect(extractChessDotComLiveGameId("/")).toBeNull();
    expect(extractChessDotComLiveGameId("/play/online")).toBeNull();
    expect(extractChessDotComLiveGameId("/game/daily/123")).toBeNull();
    expect(extractChessDotComLiveGameId("/analysis")).toBeNull();
    expect(extractChessDotComLiveGameId("/game/")).toBeNull();
  });
});
