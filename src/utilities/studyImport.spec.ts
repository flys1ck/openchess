import { parsePgn } from "chessops/pgn";
import { describe, expect, it } from "vitest";
import { ImportSettings, buildImportPlan, collectHeaders, suggestImportHeaders } from "./studyImport";

const settings: ImportSettings = {
  chapterHeader: "White",
  lineHeader: "Black",
  orientation: "black",
  splitVariations: false,
};

function game(headers: Record<string, string>, moves: string) {
  const tags = Object.entries(headers)
    .map(([name, value]) => `[${name} "${value}"]`)
    .join("\n");
  return `${tags}\n\n${moves} *\n\n`;
}

describe("collectHeaders", () => {
  it("should list every tag with the number of games that have it", () => {
    const games = parsePgn(
      game({ White: "Chapter 1", Black: "Line A" }, "1. d4") +
        game({ White: "Chapter 1", Black: "Line B" }, "1. d4") +
        game({ White: "Chapter 2", Black: "Line C", Annotator: "Max" }, "1. d4")
    );

    const headers = collectHeaders(games);

    expect(headers.find((header) => header.name === "White")).toEqual({ name: "White", count: 3 });
    expect(headers.find((header) => header.name === "Annotator")).toEqual({ name: "Annotator", count: 1 });
  });

  it("should ignore placeholder values that chessops fills in", () => {
    const headers = collectHeaders(parsePgn(game({ Event: "Study" }, "1. d4")));

    expect(headers.map((header) => header.name)).toEqual(["Event"]);
  });
});

describe("suggestImportHeaders", () => {
  const header = (name: string) => ({ name, count: 1 });

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
  it("should build chapters, lines and positions from the mainline and its sidelines", () => {
    const games = parsePgn(game({ White: "Intro", Black: "Main line" }, "1. d4 d5 2. c4 (2. Nf3) e6"));

    const plan = buildImportPlan(games, settings);

    expect(plan.warnings).toEqual([]);
    expect(plan.chapters).toHaveLength(1);
    expect(plan.chapters[0].name).toBe("Intro");
    const line = plan.chapters[0].lines[0];
    expect(line).toMatchObject({ name: "Main line", moves: "d4 d5 c4 e6", orientation: "black", warnings: [] });
    expect(line.pgn).toContain("2. c4");
    expect(line.positions.map((position) => [position.ply, position.san])).toEqual([
      [0, "d4"],
      [1, "d5"],
      [2, "c4"],
      [3, "e6"],
      [2, "Nf3"],
    ]);
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

  it("should index a move once when a line reaches it twice", () => {
    const games = parsePgn(game({ White: "Chapter", Black: "Line" }, "1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 (3. d4) Nf6"));

    const line = buildImportPlan(games, settings).chapters[0].lines[0];

    expect(line.positions.map((position) => position.san)).toEqual(["Nf3", "Nf6", "Ng1", "Ng8", "d4"]);
    expect(line.warnings).toEqual([]);
  });

  it("should keep indexing the mainline after an illegal move in a sideline", () => {
    const games = parsePgn(game({ White: "Chapter", Black: "Line" }, "1. d4 (1. Ke2) d5"));

    const line = buildImportPlan(games, settings).chapters[0].lines[0];

    expect(line.positions.map((position) => position.san)).toEqual(["d4", "d5"]);
    expect(line.warnings).toEqual(["Stops at ply 0: Ke2 is not a legal move"]);
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

describe("buildImportPlan with splitVariations", () => {
  const splitSettings = { ...settings, splitVariations: true };
  const lineNames = (pgn: string, overrides: Partial<ImportSettings> = {}) =>
    buildImportPlan(parsePgn(pgn), { ...splitSettings, ...overrides }).chapters.map((chapter) =>
      chapter.lines.map((line) => line.name)
    );

  it("should create one line per variation in PGN order", () => {
    const pgn = game(
      { White: "Chapter", Black: "QGD" },
      "1. d4 d5 2. c4 (2. Nf3 Nf6 (2... c5) 3. g3) (2. Bf4) e6 3. Nc3 (3. Nf3)"
    );

    expect(lineNames(pgn)).toEqual([["QGD", "QGD · 2.Nf3", "QGD · 2.Nf3 2...c5", "QGD · 2.Bf4", "QGD · 3.Nf3"]]);
  });

  it("should index each variation as its own mainline", () => {
    const pgn = game({ White: "Chapter", Black: "QGD" }, "1. d4 d5 2. c4 (2. Nf3 { Quieter } Nf6) e6");

    const [main, sideline] = buildImportPlan(parsePgn(pgn), splitSettings).chapters[0].lines;

    expect(main).toMatchObject({ moves: "d4 d5 c4 e6", warnings: [] });
    expect(sideline).toMatchObject({ moves: "d4 d5 Nf3 Nf6", warnings: [] });
    expect(sideline.positions.map((position) => position.ply)).toEqual([0, 1, 2, 3]);
    expect(sideline.pgn).toContain("2. Nf3 { Quieter } Nf6");
    expect(sideline.pgn).not.toContain("c4");
  });

  it("should merge a move that is listed twice at the same point", () => {
    const pgn = game({ White: "Chapter", Black: "Line" }, "1. e4 (1. d4 d5) (1. d4 { Again } Nf6) e5");

    const lines = buildImportPlan(parsePgn(pgn), splitSettings).chapters[0].lines;

    expect(lines.map((line) => [line.name, line.moves])).toEqual([
      ["Line", "e4 e5"],
      ["Line · 1.d4", "d4 d5"],
      ["Line · 1.d4 1...Nf6", "d4 Nf6"],
    ]);
    expect(lines.flatMap((line) => line.warnings)).toEqual([]);
    expect(lines[2].pgn).toContain("{ Again }");
  });

  it("should number moves from the FEN header", () => {
    const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 3 3";
    const pgn = game({ White: "Chapter", Black: "Italian", SetUp: "1", FEN: fen }, "3... Nf6 (3... Bc5 4. c3) 4. d4");

    expect(lineNames(pgn)).toEqual([["Italian", "Italian · 3...Bc5"]]);
  });

  it("should keep a game without variations as a single line", () => {
    expect(lineNames(game({ White: "Chapter", Black: "Line" }, "1. e4 e5"))).toEqual([["Line"]]);
    expect(lineNames(game({ White: "Chapter", Black: "Empty" }, ""))).toEqual([["Empty"]]);
  });

  it("should give all variations of a game the same generated name without a line header", () => {
    const pgn =
      game({ White: "Chapter", Black: "A" }, "1. e4 (1. d4) e5") + game({ White: "Chapter", Black: "B" }, "1. c4");

    expect(lineNames(pgn, { lineHeader: "" })).toEqual([["Line 1", "Line 1 · 1.d4", "Line 2"]]);
  });

  it("should warn only on the variation with an illegal move", () => {
    const pgn = game({ White: "Chapter", Black: "Line" }, "1. e4 (1. d4 d5 2. Ke4) e5");

    const lines = buildImportPlan(parsePgn(pgn), splitSettings).chapters[0].lines;

    expect(lines.map((line) => line.warnings)).toEqual([[], ["Stops at ply 2: Ke4 is not a legal move"]]);
  });
});
