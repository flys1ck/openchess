import { describe, expect, it } from "vitest";
import { formatComment } from "./comment";

describe("formatComment", () => {
  it("should replace html content ", () => {
    expect(formatComment("<b>test</b>")).toBe("");
    expect(formatComment("<script>alert('hello')</script>")).toBe("");
  });

  it("should replace custom pgn comments", () => {
    expect(formatComment("[test]")).toBe("");
    expect(formatComment("[test] [test2]")).toBe("");
    expect(formatComment("[test] test [test2]")).toBe("test");
  });

  it("should unescape chessable brackets", () => {
    expect(formatComment("@@StartBracket@@test@@EndBracket@@")).toBe("(test)");
  });

  it("should remove chessable fen information", () => {
    expect(formatComment("@@StartFEN@@test@@EndFEN@@")).toBe("");
  });

  it("should highlight chess moves", () => {
    expect(formatComment("c4")).toBe("<b>c4</b>");
    expect(formatComment("1.c4")).toBe("<b>1.c4</b>");
    expect(formatComment("1.c4 c5")).toBe("<b>1.c4</b> <b>c5</b>");
    expect(formatComment("1.c4 c5 2.Nf3")).toBe("<b>1.c4</b> <b>c5</b> <b>2.Nf3</b>");
    expect(formatComment("b7-b5")).toBe("<b>b7</b>-<b>b5</b>");
    expect(formatComment("0-0")).toBe("<b>0-0</b>");
    expect(formatComment("0-0-0")).toBe("<b>0-0-0</b>");
    // expect(formatComment("O-O")).toBe("<b>O-O</b>");
    // expect(formatComment("O-O-O")).toBe("<b>O-O-O</b>");
  });
});
