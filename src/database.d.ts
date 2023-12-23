import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Chapters {
  created_at: Generated<string>;
  id: Generated<number>;
  name: string;
  study: number;
}

export interface Lines {
  chapter: number;
  created_at: Generated<string>;
  id: Generated<number>;
  moves: string;
  name: string;
  orientation: Generated<string>;
  pgn: string;
  study: number;
}

export interface Positions {
  chapter: number | null;
  created_at: Generated<string>;
  destination: Generated<string>;
  fen: string;
  id: Generated<number>;
  line: number | null;
  san: string;
  source: Generated<string>;
  study: number | null;
}

export interface Settings {
  key: string;
  value: string;
}

export interface Studies {
  created_at: Generated<string>;
  description: string | null;
  id: Generated<number>;
  name: string;
}

export interface DB {
  chapters: Chapters;
  lines: Lines;
  positions: Positions;
  settings: Settings;
  studies: Studies;
}
