import { parsePgn } from "chessops/pgn";
import { describe, expect, it } from "vitest";
import { ImportSettings, buildImportPlan, collectHeaders, suggestImportHeaders } from "./studyImport";

const settings: ImportSettings = { chapterHeader: "White", lineHeader: "Black", orientation: "black" };

function game(headers: Record<string, string>, moves: string) {
  const tags = Object.entries(headers)
    .map(([name, value]) => `[${name} "${value}"]`)
    .join("\n");
  return `${tags}\n\n${moves} *\n\n`;
}

describe("collectHeaders", () => {
  it("should list every tag with its count and distinct samples", () => {
    const games = parsePgn(
      game({ White: "Chapter 1", Black: "Line A" }, "1. d4") +
        game({ White: "Chapter 1", Black: "Line B" }, "1. d4") +
        game({ White: "Chapter 2", Black: "Line C", Annotator: "Max" }, "1. d4")
    );

    const headers = collectHeaders(games);

    expect(headers.find((header) => header.name === "White")).toEqual({
      name: "White",
      count: 3,
      samples: ["Chapter 1", "Chapter 2"],
    });
    expect(headers.find((header) => header.name === "Annotator")).toEqual({
      name: "Annotator",
      count: 1,
      samples: ["Max"],
    });
  });

  it("should ignore placeholder values that chessops fills in", () => {
    const headers = collectHeaders(parsePgn(game({ Event: "Study" }, "1. d4")));

    expect(headers.map((header) => header.name)).toEqual(["Event"]);
  });

  it("should keep at most three samples", () => {
    const pgn = ["A", "B", "C", "D"].map((name) => game({ Black: name }, "1. d4")).join("");

    const black = collectHeaders(parsePgn(pgn)).find((header) => header.name === "Black");

    expect(black?.count).toBe(4);
    expect(black?.samples).toEqual(["A", "B", "C"]);
  });
});

describe("suggestImportHeaders", () => {
  const header = (name: string) => ({ name, count: 1, samples: [] });

  it("should use White as chapter and Black as line for Chessable exports", () => {
    expect(suggestImportHeaders([header("Event"), header("White"), header("Black")])).toEqual({
      chapterHeader: "White",
      lineHeader: "Black",
    });
  });

  it("should prefer ChapterName for Lichess study exports", () => {
    expect(suggestImportHeaders([header("Event"), header("StudyName"), header("ChapterName")])).toEqual({
      chapterHeader: "ChapterName",
      lineHeader: "",
    });
  });

  it("should fall back to the first header", () => {
    expect(suggestImportHeaders([header("Opening"), header("ECO")])).toEqual({
      chapterHeader: "Opening",
      lineHeader: "",
    });
    expect(suggestImportHeaders([])).toEqual({ chapterHeader: "", lineHeader: "" });
  });
});

describe("buildImportPlan", () => {
  it("should build chapters, lines and positions from the mainline", () => {
    const games = parsePgn(game({ White: "Intro", Black: "Main line" }, "1. d4 d5 2. c4 (2. Nf3) e6"));

    const plan = buildImportPlan(games, settings);

    expect(plan.warnings).toEqual([]);
    expect(plan.chapters).toHaveLength(1);
    expect(plan.chapters[0].name).toBe("Intro");
    const line = plan.chapters[0].lines[0];
    expect(line).toMatchObject({ name: "Main line", moves: "d4 d5 c4 e6", orientation: "black", warnings: [] });
    expect(line.pgn).toContain("2. c4");
    expect(line.positions).toHaveLength(4);
    expect(line.positions[0]).toEqual({
      positionKey: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      ply: 0,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      source: "d2",
      destination: "d4",
      san: "d4",
    });
    expect(line.positions[3]).toMatchObject({ ply: 3, fullmoveNumber: 2, source: "e7", destination: "e6", san: "e6" });
  });

  it("should group games with the same chapter name into one chapter", () => {
    const games = parsePgn(
      game({ White: "Chapter 1", Black: "A" }, "1. d4") +
        game({ White: "Chapter 2", Black: "B" }, "1. e4") +
        game({ White: "Chapter 1", Black: "C" }, "1. c4")
    );

    const plan = buildImportPlan(games, settings);

    expect(plan.chapters.map((chapter) => chapter.name)).toEqual(["Chapter 1", "Chapter 2"]);
    expect(plan.chapters[0].lines.map((line) => line.name)).toEqual(["A", "C"]);
  });

  it("should import a text-only null move lesson without positions or warnings", () => {
    const games = parsePgn(game({ White: "Introduction", Black: "Welcome" }, "{ Welcome to the course } --"));

    const line = buildImportPlan(games, settings).chapters[0].lines[0];

    expect(line.positions).toEqual([]);
    expect(line.moves).toBe("--");
    expect(line.warnings).toEqual([]);
  });

  it("should stop at the first illegal move and warn", () => {
    const games = parsePgn(game({ White: "Chapter", Black: "Broken" }, "1. d4 d5 2. Ke4 e6"));

    const line = buildImportPlan(games, settings).chapters[0].lines[0];

    expect(line.positions.map((position) => position.san)).toEqual(["d4", "d5"]);
    expect(line.warnings).toEqual(["Stops at ply 2: Ke4 is not a legal move"]);
  });

  it("should warn about a null move after the first ply", () => {
    const games = parsePgn(game({ White: "Chapter", Black: "Pass" }, "1. d4 -- 2. c4"));

    const line = buildImportPlan(games, settings).chapters[0].lines[0];

    expect(line.positions).toHaveLength(1);
    expect(line.warnings).toEqual(["Stops at ply 1: -- is not a legal move"]);
  });

  it("should warn about missing headers and fall back to generated line names", () => {
    const games = parsePgn(game({ Event: "Lichess study" }, "1. e4"));

    const plan = buildImportPlan(games, settings);

    expect(plan.chapters[0].name).toBe("");
    expect(plan.chapters[0].lines[0].name).toBe("Line 1");
    expect(plan.chapters[0].lines[0].warnings).toEqual([
      'Missing chapter header "White"',
      'Missing line header "Black"',
    ]);
  });

  it("should name lines after their position in the chapter when no line header is chosen", () => {
    const games = parsePgn(
      game({ White: "Chapter 1", Black: "A" }, "1. e4") +
        game({ White: "Chapter 2", Black: "B" }, "1. d4") +
        game({ White: "Chapter 1", Black: "C" }, "1. c4")
    );

    const chapters = buildImportPlan(games, { ...settings, lineHeader: "" }).chapters;

    expect(chapters.map((chapter) => chapter.lines.map((line) => line.name))).toEqual([
      ["Line 1", "Line 2"],
      ["Line 1"],
    ]);
    expect(chapters.flatMap((chapter) => chapter.lines.flatMap((line) => line.warnings))).toEqual([]);
  });

  it("should number duplicate line names within a chapter and warn", () => {
    const games = parsePgn(
      game({ White: "Chapter", Black: "Same" }, "1. d4") +
        game({ White: "Chapter", Black: "Same (2)" }, "1. c4") +
        game({ White: "Chapter", Black: "Same" }, "1. e4")
    );

    const lines = buildImportPlan(games, settings).chapters[0].lines;

    expect(lines.map((line) => line.name)).toEqual(["Same", "Same (2)", "Same (3)"]);
    expect(lines[2].warnings).toEqual(['Renamed to "Same (3)" because the chapter already has a line with this name']);
  });

  it("should start from the FEN header", () => {
    const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
    const games = parsePgn(game({ White: "Chapter", Black: "Italian", SetUp: "1", FEN: fen }, "3. Bc4 Bc5"));

    const positions = buildImportPlan(games, settings).chapters[0].lines[0].positions;

    expect(positions[0]).toMatchObject({
      positionKey: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -",
      halfmoveClock: 2,
      fullmoveNumber: 3,
      san: "Bc4",
    });
    expect(positions[1]).toMatchObject({ halfmoveClock: 3, fullmoveNumber: 3, san: "Bc5" });
  });

  it("should skip games with an invalid starting position", () => {
    const games = parsePgn(
      game({ White: "Chapter", Black: "Bad", FEN: "not a fen" }, "1. e4") +
        game({ White: "Chapter", Black: "Good" }, "1. e4")
    );

    const plan = buildImportPlan(games, settings);

    expect(plan.warnings).toEqual(["Skipped game 1: invalid starting position"]);
    expect(plan.chapters[0].lines.map((line) => line.name)).toEqual(["Good"]);
  });
});
