import { describe, expect, it } from "vitest";
import { fixCastlingDestination } from "./move";

describe("fixCastlingDestination", () => {
  it("maps king UCI castle dests to the king square", () => {
    expect(fixCastlingDestination("e1", "h1", "king")).toBe("g1");
    expect(fixCastlingDestination("e1", "a1", "king")).toBe("c1");
    expect(fixCastlingDestination("e8", "h8", "king")).toBe("g8");
    expect(fixCastlingDestination("e8", "a8", "king")).toBe("c8");
  });

  it("leaves non-castle dests unchanged", () => {
    expect(fixCastlingDestination("e1", "g1", "king")).toBe("g1");
    expect(fixCastlingDestination("e2", "e4", "pawn")).toBe("e4");
    expect(fixCastlingDestination("e1", "h1", "pawn")).toBe("h1");
  });
});
