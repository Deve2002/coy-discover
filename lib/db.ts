import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { seedDatabase } from "./seed.mjs";

const SCHEMA_PATH = path.join(process.cwd(), "lib", "schema.sql");

/** Open a database (file path or ":memory:") and make sure the schema exists. */
export function openDatabase(file: string): Database.Database {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));
  return db;
}

// Reuse one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __coyDb?: Database.Database };

/** The app's shared database connection. */
export function getDb(): Database.Database {
  if (!globalForDb.__coyDb) {
    const file = process.env.DB_PATH ?? path.join(process.cwd(), "data", "coy.db");
    const db = openDatabase(file);
    // First run on a fresh database: fill it so the app works without a separate seed step.
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM profiles").get() as { n: number };
    if (n === 0) seedDatabase(db);
    globalForDb.__coyDb = db;
  }
  return globalForDb.__coyDb;
}
