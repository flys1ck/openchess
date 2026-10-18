import { NormalMove, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { Game, PgnNodeData, makePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { getPositionKey } from "./move";

export type Orientation = "white" | "black";

export interface ImportSettings {
  chapterHeader: string;
  lineHeader: string;
  orientation: Orientation;
}

export interface HeaderSummary {
  name: string;
  count: number;
}

export interface PlannedPosition {
  positionKey: string;
  ply: number;
  halfmoveClock: number;
  fullmoveNumber: number;
  source: string;
  destination: string;
  san: string;
}

export interface PlannedLine {
  name: string;
  pgn: string;
  moves: string;
  orientation: Orientation;
  positions: PlannedPosition[];
  warnings: string[];
}

export interface PlannedChapter {
  name: string;
  lines: PlannedLine[];
}

export interface ImportPlan {
  chapters: PlannedChapter[];
  warnings: string[];
}

// chessops fills absent Seven Tag Roster tags with "?", "????.??.??" or "*"
const UNKNOWN_HEADER_VALUE = /^[?.*]*$/;

export function collectHeaders(games: Game<PgnNodeData>[]): HeaderSummary[] {
  const summaries = new Map<string, HeaderSummary>();
  for (const game of games) {
    for (const [name, value] of game.headers) {
      if (UNKNOWN_HEADER_VALUE.test(value)) continue;
      const summary = summaries.get(name) ?? { name, count: 0 };
      summary.count++;
      summaries.set(name, summary);
    }
  }
  return [...summaries.values()];
}

// Lichess study exports name chapters in ChapterName, Chessable exports put the chapter in White and the line in Black
const PREFERRED_CHAPTER_HEADERS = ["ChapterName", "White", "Event"];

export function suggestImportHeaders(headers: HeaderSummary[]): Pick<ImportSettings, "chapterHeader" | "lineHeader"> {
  const names = headers.map((header) => header.name);
  const chapterHeader = PREFERRED_CHAPTER_HEADERS.find((name) => names.includes(name)) ?? names[0] ?? "";
  const lineHeader = chapterHeader === "White" && names.includes("Black") ? "Black" : "";
  return { chapterHeader, lineHeader };
}

export function buildImportPlan(games: Game<PgnNodeData>[], settings: ImportSettings): ImportPlan {
  const chapters = new Map<string, PlannedChapter>();
  const warnings: string[] = [];

  games.forEach((game, index) => {
    const startResult = startingPosition(game.headers);
    if (startResult.isErr) {
      warnings.push(`Skipped game ${index + 1}: invalid starting position`);
      return;
    }

    const lineWarnings: string[] = [];
    const chapterName = readHeader(game, settings.chapterHeader);
    if (chapterName === undefined) lineWarnings.push(`Missing chapter header "${settings.chapterHeader}"`);
    const lineName = settings.lineHeader ? readHeader(game, settings.lineHeader) : "";
    if (lineName === undefined) lineWarnings.push(`Missing line header "${settings.lineHeader}"`);

    const sanMoves = [...game.moves.mainline()].map((node) => node.san);
    const pos = startResult.value;
    const positions: PlannedPosition[] = [];
    for (const san of sanMoves) {
      const move = parseSan(pos, san) as NormalMove | undefined;
      if (!move) {
        // Chessable exports text-only lessons as a single null move
        const isTextOnly = san === "--" && positions.length === 0;
        if (!isTextOnly) lineWarnings.push(`Stops at ply ${positions.length}: ${san} is not a legal move`);
        break;
      }
      positions.push({
        positionKey: getPositionKey(makeFen(pos.toSetup())),
        ply: positions.length,
        halfmoveClock: pos.halfmoves,
        fullmoveNumber: pos.fullmoves,
        source: makeSquare(move.from),
        destination: makeSquare(move.to),
        san,
      });
      pos.play(move);
    }

    let chapter = chapters.get(chapterName ?? "");
    if (!chapter) {
      chapter = { name: chapterName ?? "", lines: [] };
      chapters.set(chapter.name, chapter);
    }
    // Names are unique per chapter and derived deterministically, so a re-import replaces the same lines
    const baseName = lineName || `Line ${chapter.lines.length + 1}`;
    let name = baseName;
    for (let occurrence = 2; chapter.lines.some((line) => line.name === name); occurrence++) {
      name = `${baseName} (${occurrence})`;
    }
    if (name !== baseName)
      lineWarnings.push(`Renamed to "${name}" because the chapter already has a line with this name`);
    chapter.lines.push({
      name,
      pgn: makePgn(game),
      moves: sanMoves.join(" "),
      orientation: settings.orientation,
      positions,
      warnings: lineWarnings,
    });
  });

  return { chapters: [...chapters.values()], warnings };
}

function readHeader(game: Game<PgnNodeData>, name: string) {
  const value = game.headers.get(name);
  if (value === undefined || UNKNOWN_HEADER_VALUE.test(value)) return undefined;
  return value;
}
