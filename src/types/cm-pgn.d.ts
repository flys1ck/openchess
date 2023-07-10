// TODO:
declare module "cm-pgn/src/Pgn" {
  declare const files: readonly ["a", "b", "c", "d", "e", "f", "g", "h"];
  declare const ranks: readonly ["1", "2", "3", "4", "5", "6", "7", "8"];
  type Key = `${File}${Rank}`;

  export class Pgn {
    constructor(pgn: string);
    header: Header;
    history: History;
  }

  interface Header {
    tags: Record<string, string>;
  }

  interface History {
    moves: Move[];
  }

  interface Move {
    color: "w" | "b";
    fen: string;
    flags: "n" | "b" | "e" | "c" | "p" | "k" | "q";
    from: Key;
    next: Move;
    piece: "p" | "n" | "b" | "r" | "q" | "k";
    ply: number; // the ply number
    previous?: Move; // a pointer to the previous move
    san: string; // the move in SAN notation
    to: Key; // the square to
    uci: `${Key}|${Key}`; // the move in UCI notation
    variation: Move[]; // a pointer to the begin of the current variation
    variations: Move[][]; // all variations starting with that move
  }
}
