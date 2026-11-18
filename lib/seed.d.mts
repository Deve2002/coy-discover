import type Database from "better-sqlite3";
export function seedDatabase(db: Database.Database): { profiles: number; likesMe: number };
