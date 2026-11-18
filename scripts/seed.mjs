// Usage: npm run seed
// Creates data/coy.db, fills it with mock profiles, and writes placeholder avatars to public/avatars.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { seedDatabase } from "../lib/seed.mjs";
import { ME, PEOPLE } from "../lib/seed-data.mjs";
import { avatarSvg } from "../lib/avatar.mjs";

const root = process.cwd();
const dbFile = process.env.DB_PATH ?? path.join(root, "data", "coy.db");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(path.join(root, "lib", "schema.sql"), "utf8"));
const result = seedDatabase(db);
db.close();

const avatarDir = path.join(root, "public", "avatars");
fs.mkdirSync(avatarDir, { recursive: true });
fs.writeFileSync(path.join(avatarDir, `${ME.id}.svg`), avatarSvg(ME.id, ME.name));
PEOPLE.forEach(([name], i) => {
  const id = `p${String(i + 1).padStart(2, "0")}`;
  fs.writeFileSync(path.join(avatarDir, `${id}.svg`), avatarSvg(id, name));
});

console.log(`Seeded ${result.profiles} profiles (${result.likesMe} already like you) into ${dbFile}`);
