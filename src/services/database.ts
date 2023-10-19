import { DB } from "@/database";
import { CompiledQuery, DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import Database from "tauri-plugin-sql-api";

// Kysely query builder. Used to build queries and return typed results.
export const db = new Kysely<DB>({
  dialect: {
    createAdapter() {
      return new SqliteAdapter();
    },
    createDriver() {
      return new DummyDriver();
    },
    createIntrospector(db: Kysely<unknown>) {
      return new SqliteIntrospector(db);
    },
    createQueryCompiler() {
      return new SqliteQueryCompiler();
    },
  },
});

// Tauri SQL plugin connector. Executes generated queries in rust
const database = await Database.load("sqlite:db.sqlite");

export async function execute(query: CompiledQuery) {
  return await database.execute(query.sql, query.parameters as unknown[]);
}

export async function select<T>(query: CompiledQuery<T>) {
  return await database.select<T[]>(query.sql, query.parameters as unknown[]);
}

export async function selectFirst<T>(query: CompiledQuery<T>) {
  return (await database.select<T[]>(query.sql, query.parameters as unknown[]))[0];
}
