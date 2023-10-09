import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Chapters {
  id: Generated<number>;
  created_at: Generated<string>;
  study: number;
  name: string;
}

export interface Lines {
  id: Generated<number>;
  created_at: Generated<string>;
  name: string;
  pgn: string;
  chapter: number;
  moves: string;
  study: number;
  orientation: Generated<string>;
}

export interface Positions {
  id: Generated<number>;
  created_at: Generated<string>;
  fen: string;
  study: number | null;
  chapter: number | null;
  line: number | null;
  san: string;
  source: Generated<string>;
  destination: Generated<string>;
}

export interface Settings {
  setting_key: string;
  setting_value: string;
}

export interface Studies {
  id: Generated<number>;
  created_at: Generated<string>;
  name: string;
  description: string | null;
}

export interface DB {
  chapters: Chapters;
  lines: Lines;
  positions: Positions;
  settings: Settings;
  studies: Studies;
}
