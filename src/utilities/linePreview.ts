import { INITIAL_FEN } from "chessops/fen";

export interface LineMoves {
  moves: string;
  startFen?: string | null;
}

export function getStartPly(fen: string): number {
  const [, turn, , , , fullmoves] = fen.split(" ");
  return ((Number(fullmoves) || 1) - 1) * 2 + (turn === "b" ? 1 : 0);
}

export function formatSanMoves(sanMoves: string[], startPly = 0): string {
  return sanMoves
    .map((san, i) => {
      const ply = startPly + i;
      const moveNumber = Math.floor(ply / 2) + 1;
      if (ply % 2 === 0) return `${moveNumber}.${san}`;
      return i === 0 ? `${moveNumber}...${san}` : san;
    })
    .join(" ");
}

function countCommonPlies(lines: string[][]): number {
  if (lines.length < 2) return 0;
  const shortest = Math.min(...lines.map((line) => line.length));
  let plies = 0;
  while (plies < shortest && lines.every((line) => line[plies] === lines[0][plies])) plies++;
  return plies;
}

/**
 * Formats each line's moves with move numbers, leaving out the opening moves that all lines of a chapter share, so the
 * preview shows where the lines differ. Lines from a custom start position are numbered from that position.
 */
export function getLinePreviews(lines: LineMoves[]): string[] {
  const parsed = lines.map((line) => ({
    sanMoves: line.moves.split(/\s+/).filter(Boolean),
    startFen: line.startFen && line.startFen !== INITIAL_FEN ? line.startFen : undefined,
  }));
  const commonPlies = countCommonPlies(
    parsed.filter((line) => !line.startFen && line.sanMoves.length).map((line) => line.sanMoves)
  );

  return parsed.map(({ sanMoves, startFen }) => {
    if (startFen) return formatSanMoves(sanMoves, getStartPly(startFen));
    return formatSanMoves(sanMoves.slice(commonPlies), commonPlies);
  });
}
