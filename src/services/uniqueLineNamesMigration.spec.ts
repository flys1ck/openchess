import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

const migrationDirectory = fileURLToPath(
  new URL("../../src-tauri/migrations/2026-10-18-120000_unique_line_names/", import.meta.url)
);
const upMigration = readFileSync(`${migrationDirectory}/up.sql`, "utf8");
const downMigration = readFileSync(`${migrationDirectory}/down.sql`, "utf8");

const databases: Database.Database[] = [];

afterEach(() => {
  for (const database of databases) database.close();
  databases.length = 0;
});

function createDatabase(lines: [id: number, chapter: number, name: string][]) {
  const database = new Database(":memory:");
  databases.push(database);
  database.exec(`
    create table lines (
      id integer primary key not null,
      name text not null,
      chapter integer not null
    );

    create index idx_lines_chapter_name on lines (chapter, name);
  `);
  const insert = database.prepare("insert into lines (id, chapter, name) values (?, ?, ?)");
  for (const line of lines) insert.run(...line);
  return database;
}

function migrate(database: Database.Database, sql: string) {
  database.transaction(() => database.exec(sql))();
}

function lineNames(database: Database.Database) {
  return database.prepare("select id, chapter, name from lines order by id").all();
}

describe("unique line names migration", () => {
  it("keeps every duplicate line and numbers the repeats", () => {
    const database = createDatabase([
      [1, 1, "Main line"],
      [2, 1, "Main line"],
      [3, 1, "Main line"],
      [4, 2, "Main line"],
    ]);

    migrate(database, upMigration);

    expect(lineNames(database)).toEqual([
      { id: 1, chapter: 1, name: "Main line" },
      { id: 2, chapter: 1, name: "Main line (2)" },
      { id: 3, chapter: 1, name: "Main line (3)" },
      { id: 4, chapter: 2, name: "Main line" },
    ]);
  });

  it("names blank lines after their position in the chapter", () => {
    const database = createDatabase([
      [1, 1, "Intro"],
      [2, 1, ""],
      [3, 1, " "],
      [4, 2, ""],
    ]);

    migrate(database, upMigration);

    expect(lineNames(database)).toEqual([
      { id: 1, chapter: 1, name: "Intro" },
      { id: 2, chapter: 1, name: "Line 2" },
      { id: 3, chapter: 1, name: "Line 3" },
      { id: 4, chapter: 2, name: "Line 1" },
    ]);
  });

  it("falls back to the line id when the numbered name is taken", () => {
    const database = createDatabase([
      [1, 1, "Line 1"],
      [2, 1, ""],
      [3, 1, "Main line (2)"],
      [4, 1, "Main line"],
      [5, 1, "Main line"],
    ]);

    migrate(database, upMigration);

    expect(lineNames(database)).toEqual([
      { id: 1, chapter: 1, name: "Line 1" },
      { id: 2, chapter: 1, name: "Line 2" },
      { id: 3, chapter: 1, name: "Main line (2)" },
      { id: 4, chapter: 1, name: "Main line" },
      { id: 5, chapter: 1, name: "Main line (#5)" },
    ]);
  });

  it("rejects duplicate line names afterwards and restores the plain index on rollback", () => {
    const database = createDatabase([[1, 1, "Main line"]]);
    migrate(database, upMigration);

    expect(() => database.prepare("insert into lines (chapter, name) values (1, 'Main line')").run()).toThrow(
      /unique constraint failed/i
    );

    migrate(database, downMigration);
    database.prepare("insert into lines (chapter, name) values (1, 'Main line')").run();
    expect(database.prepare("select count(*) as count from lines").get()).toEqual({ count: 2 });
  });
});
