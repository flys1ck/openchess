import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

const migrationDirectory = fileURLToPath(
  new URL("../../src-tauri/migrations/2026-07-25-004300_deduplicate_positions/", import.meta.url)
);
const upMigration = readFileSync(`${migrationDirectory}/up.sql`, "utf8");
const downMigration = readFileSync(`${migrationDirectory}/down.sql`, "utf8");

const initialPositionKey = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
const afterE4PositionKey = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3";

const databases: Database.Database[] = [];

afterEach(() => {
  for (const database of databases) database.close();
  databases.length = 0;
});

function createLegacyDatabase() {
  const database = new Database(":memory:");
  databases.push(database);
  database.pragma("foreign_keys = ON");
  database.exec(`
    create table lines (
      id integer primary key not null
    );

    create table positions (
      id integer primary key not null,
      created_at timestamp default current_timestamp not null,
      fen text not null,
      position_key text not null,
      line integer not null,
      san text not null,
      source text default '' not null,
      destination text default '' not null,
      foreign key (line) references lines(id) on delete cascade
    );

    create unique index idx_positions_line_fen on positions (line, fen);
    create index idx_positions_position_key on positions (position_key);

    insert into lines (id) values (1), (2);

    insert into positions (
      id,
      created_at,
      fen,
      position_key,
      line,
      san,
      source,
      destination
    )
    values
      (1, '2026-01-01 00:00:01', '${initialPositionKey} 0 5', '${initialPositionKey}', 1, 'e4', 'e2', 'e4'),
      (2, '2026-01-01 00:00:02', '${afterE4PositionKey} 0 5', '${afterE4PositionKey}', 1, 'e5', 'e7', 'e5'),
      (3, '2026-01-01 00:00:03', '${initialPositionKey} 4 6', '${initialPositionKey}', 1, 'Nf3', 'g1', 'f3'),
      (4, '2026-01-01 00:00:04', '${initialPositionKey} 7 20', '${initialPositionKey}', 2, 'e4', 'e2', 'e4');
  `);
  return database;
}

function migrate(database: Database.Database, sql: string) {
  database.transaction(() => database.exec(sql))();
}

describe("deduplicate positions migration", () => {
  it("deduplicates keys while preserving every occurrence and exact FEN", () => {
    const database = createLegacyDatabase();
    migrate(database, upMigration);

    expect(database.prepare("select count(*) as count from chess_positions").get()).toEqual({ count: 2 });
    expect(
      database
        .prepare(
          `
            select
              positions.id,
              positions.ply,
              chess_positions.position_key
                || ' '
                || positions.halfmove_clock
                || ' '
                || positions.fullmove_number as fen
            from positions
            inner join chess_positions on chess_positions.id = positions.chess_position
            order by positions.id
          `
        )
        .all()
    ).toEqual([
      { id: 1, ply: 0, fen: `${initialPositionKey} 0 5` },
      { id: 2, ply: 1, fen: `${afterE4PositionKey} 0 5` },
      { id: 3, ply: 2, fen: `${initialPositionKey} 4 6` },
      { id: 4, ply: 0, fen: `${initialPositionKey} 7 20` },
    ]);

    expect(database.pragma("foreign_key_check")).toEqual([]);

    migrate(database, downMigration);
    expect(database.prepare("select id, created_at, fen, position_key from positions order by id").all()).toEqual([
      {
        id: 1,
        created_at: "2026-01-01 00:00:01",
        fen: `${initialPositionKey} 0 5`,
        position_key: initialPositionKey,
      },
      {
        id: 2,
        created_at: "2026-01-01 00:00:02",
        fen: `${afterE4PositionKey} 0 5`,
        position_key: afterE4PositionKey,
      },
      {
        id: 3,
        created_at: "2026-01-01 00:00:03",
        fen: `${initialPositionKey} 4 6`,
        position_key: initialPositionKey,
      },
      {
        id: 4,
        created_at: "2026-01-01 00:00:04",
        fen: `${initialPositionKey} 7 20`,
        position_key: initialPositionKey,
      },
    ]);
  });

  it("preserves distinct-line move counts", () => {
    const database = createLegacyDatabase();
    migrate(database, upMigration);

    expect(
      database
        .prepare(
          `
            select positions.san, count(distinct positions.line) as line_count
            from positions
            inner join chess_positions on chess_positions.id = positions.chess_position
            where chess_positions.position_key = ?
            group by positions.source, positions.destination, positions.san
            order by positions.san
          `
        )
        .all(initialPositionKey)
    ).toEqual([
      { san: "Nf3", line_count: 1 },
      { san: "e4", line_count: 2 },
    ]);
  });

  it("removes a shared key only after its final occurrence is deleted", () => {
    const database = createLegacyDatabase();
    migrate(database, upMigration);

    database.prepare("delete from lines where id = 2").run();
    expect(database.prepare("select count(*) as count from chess_positions").get()).toEqual({ count: 2 });

    database.prepare("delete from lines where id = 1").run();
    expect(database.prepare("select count(*) as count from positions").get()).toEqual({ count: 0 });
    expect(database.prepare("select count(*) as count from chess_positions").get()).toEqual({ count: 0 });
  });

  it("rejects a legacy key that does not match its FEN", () => {
    const database = createLegacyDatabase();
    database.prepare("update positions set position_key = 'invalid' where id = 1").run();

    expect(() => migrate(database, upMigration)).toThrow(/check constraint failed/i);
    expect(database.prepare("select count(*) as count from positions").get()).toEqual({ count: 4 });
    expect(
      database
        .prepare("select count(*) as count from sqlite_master where type = 'table' and name = 'chess_positions'")
        .get()
    ).toEqual({ count: 0 });
  });
});
