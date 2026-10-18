import { NormalMove, Position, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { ChildNode, Game, Node, PgnNodeData, makePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { getPositionKey } from "./move";

export type Orientation = "white" | "black";

export interface ImportSettings {
  chapterHeader: string;
  lineHeader: string;
  orientation: Orientation;
  splitVariations: boolean;
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
  const gameCounts = new Map<string, number>();
  const warnings: string[] = [];

  games.forEach((game, index) => {
    const startResult = startingPosition(game.headers);
    if (startResult.isErr) {
      warnings.push(`Skipped game ${index + 1}: invalid starting position`);
      return;
    }

    const headerWarnings: string[] = [];
    const chapterName = readHeader(game, settings.chapterHeader);
    if (chapterName === undefined) headerWarnings.push(`Missing chapter header "${settings.chapterHeader}"`);
    const lineName = settings.lineHeader ? readHeader(game, settings.lineHeader) : "";
    if (lineName === undefined) headerWarnings.push(`Missing line header "${settings.lineHeader}"`);

    let chapter = chapters.get(chapterName ?? "");
    if (!chapter) {
      chapter = { name: chapterName ?? "", lines: [] };
      chapters.set(chapter.name, chapter);
    }
    const gameCount = (gameCounts.get(chapter.name) ?? 0) + 1;
    gameCounts.set(chapter.name, gameCount);
    const gameName = lineName || `Line ${gameCount}`;

    const variations = settings.splitVariations ? splitVariations(game, startResult.value) : [{ name: "", game }];
    for (const variation of variations) {
      const lineWarnings = [...headerWarnings];
      const { positions, warnings: positionWarnings } = indexPositions(variation.game.moves, startResult.value);
      lineWarnings.push(...positionWarnings);

      // Names are unique per chapter and derived deterministically, so a re-import replaces the same lines
      const baseName = variation.name ? `${gameName} · ${variation.name}` : gameName;
      let name = baseName;
      for (let occurrence = 2; chapter.lines.some((line) => line.name === name); occurrence++) {
        name = `${baseName} (${occurrence})`;
      }
      if (name !== baseName)
        lineWarnings.push(`Renamed to "${name}" because the chapter already has a line with this name`);
      chapter.lines.push({
        name,
        pgn: makePgn(variation.game),
        moves: [...variation.game.moves.mainline()].map((node) => node.san).join(" "),
        orientation: settings.orientation,
        positions,
        warnings: lineWarnings,
      });
    }
  });

  return { chapters: [...chapters.values()], warnings };
}

// Sidelines are indexed too, so the position lookup finds lines that only mention a position in a variation
function indexPositions(root: Node<PgnNodeData>, start: Position) {
  const positions: PlannedPosition[] = [];
  const warnings: string[] = [];
  const indexed = new Set<string>();
  const visit = (node: Node<PgnNodeData>, pos: Position, ply: number) => {
    for (const child of node.children) {
      const san = child.data.san;
      const move = parseSan(pos, san) as NormalMove | undefined;
      if (!move) {
        // Chessable exports text-only lessons as a single null move
        const isTextOnly = san === "--" && ply === 0;
        if (!isTextOnly) warnings.push(`Stops at ply ${ply}: ${san} is not a legal move`);
        continue;
      }
      const positionKey = getPositionKey(makeFen(pos.toSetup()));
      if (!indexed.has(`${positionKey} ${san}`)) {
        indexed.add(`${positionKey} ${san}`);
        positions.push({
          positionKey,
          ply,
          halfmoveClock: pos.halfmoves,
          fullmoveNumber: pos.fullmoves,
          source: makeSquare(move.from),
          destination: makeSquare(move.to),
          san,
        });
      }
      const next = pos.clone();
      next.play(move);
      visit(child, next, ply + 1);
    }
  };
  visit(root, start, 0);
  return { positions, warnings };
}

interface Variation {
  name: string;
  game: Game<PgnNodeData>;
}

interface VariationPath {
  moves: PgnNodeData[];
  // [ply, sibling index] of every move where the path leaves the first continuation
  forks: [number, number][];
}

function splitVariations(game: Game<PgnNodeData>, start: Position): Variation[] {
  const paths: VariationPath[] = [];
  const visit = (nodes: Node<PgnNodeData>[], path: VariationPath) => {
    const siblings = mergeSiblings(nodes.flatMap((node) => node.children));
    if (!siblings.length) paths.push(path);
    siblings.forEach((sibling, index) => {
      const forks: [number, number][] = index ? [...path.forks, [path.moves.length, index]] : path.forks;
      visit(sibling.nodes, { moves: [...path.moves, sibling.data], forks });
    });
  };
  visit([game.moves], { moves: [], forks: [] });
  // PGN text lists a variation and its subvariations before the next mainline branch
  paths.sort((a, b) => compareForks(a.forks, b.forks));

  return paths.map(({ moves, forks }) => ({
    name: forks.map(([ply]) => moveLabel(start, ply, moves[ply].san)).join(" "),
    game: { headers: new Map(game.headers), comments: game.comments, moves: toMainline(moves) },
  }));
}

// Courses sometimes list the same move twice at one point; merging keeps their lines from colliding
function mergeSiblings(children: ChildNode<PgnNodeData>[]) {
  const siblings: { data: PgnNodeData; nodes: ChildNode<PgnNodeData>[] }[] = [];
  for (const child of children) {
    const sibling = siblings.find((candidate) => candidate.data.san === child.data.san);
    if (!sibling) {
      siblings.push({ data: child.data, nodes: [child] });
      continue;
    }
    sibling.nodes.push(child);
    sibling.data = {
      ...sibling.data,
      startingComments: concat(sibling.data.startingComments, child.data.startingComments),
      comments: concat(sibling.data.comments, child.data.comments),
      nags: child.data.nags ? [...new Set([...(sibling.data.nags ?? []), ...child.data.nags])] : sibling.data.nags,
    };
  }
  return siblings;
}

function concat<T>(a: T[] | undefined, b: T[] | undefined) {
  return a || b ? [...(a ?? []), ...(b ?? [])] : undefined;
}

function compareForks(a: [number, number][], b: [number, number][]) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const difference = a[i][0] - b[i][0] || a[i][1] - b[i][1];
    if (difference) return difference;
  }
  return a.length - b.length;
}

function moveLabel(start: Position, ply: number, san: string) {
  const halfmoves = ply + (start.turn === "white" ? 0 : 1);
  const fullmoveNumber = start.fullmoves + Math.floor(halfmoves / 2);
  return halfmoves % 2 ? `${fullmoveNumber}...${san}` : `${fullmoveNumber}.${san}`;
}

function toMainline(moves: PgnNodeData[]) {
  const root = new Node<PgnNodeData>();
  let parent: Node<PgnNodeData> = root;
  for (const data of moves) {
    const child = new ChildNode(data);
    parent.children.push(child);
    parent = child;
  }
  return root;
}

function readHeader(game: Game<PgnNodeData>, name: string) {
  const value = game.headers.get(name);
  if (value === undefined || UNKNOWN_HEADER_VALUE.test(value)) return undefined;
  return value;
}
