import type Database from "better-sqlite3";
import type { MatchEntry, PublicProfile, SwipeAction, SwipeResult } from "./types";

export type SwipeErrorCode = "INVALID_ACTION" | "SELF_SWIPE" | "TARGET_NOT_FOUND" | "ALREADY_SWIPED";

const STATUS: Record<SwipeErrorCode, number> = {
  INVALID_ACTION: 400,
  SELF_SWIPE: 400,
  TARGET_NOT_FOUND: 404,
  ALREADY_SWIPED: 409,
};

export class SwipeError extends Error {
  status: number;
  constructor(public code: SwipeErrorCode, message: string) {
    super(message);
    this.status = STATUS[code];
  }
}

interface ProfileRow {
  id: string;
  name: string;
  age: number;
  photo_url: string;
  bio: string;
  location: string;
  interests_json: string;
}

/** Explicit field-by-field mapping, so a database column can never leak by accident. */
function toPublic(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photoUrl: row.photo_url,
    bio: row.bio,
    location: row.location,
    interests: JSON.parse(row.interests_json),
  };
}

/** Stable pseudo-random order that depends only on the profile id, never on who liked whom. */
function orderKey(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Profiles the user has not swiped on yet. */
export function getFeed(db: Database.Database, userId: string, limit?: number): PublicProfile[] {
  const rows = db
    .prepare(
      `SELECT p.* FROM profiles p
       WHERE p.id <> @me
         AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.user_id = @me AND s.target_id = p.id)`
    )
    .all({ me: userId }) as ProfileRow[];

  rows.sort((a, b) => orderKey(a.id) - orderKey(b.id) || a.id.localeCompare(b.id));
  const page = limit && limit > 0 ? rows.slice(0, limit) : rows;
  return page.map(toPublic);
}

/**
 * Record a like or pass. Returns whether it created a match.
 * The result is identical in shape for every non-match, so a caller can't tell a "they hadn't liked
 * you" outcome apart from a "pass".
 */
export function recordSwipe(
  db: Database.Database,
  userId: string,
  targetId: string,
  action: unknown
): SwipeResult {
  if (action !== "like" && action !== "pass") {
    throw new SwipeError("INVALID_ACTION", 'action must be "like" or "pass"');
  }
  if (typeof targetId !== "string" || targetId === "") {
    throw new SwipeError("TARGET_NOT_FOUND", "Profile not found");
  }
  if (targetId === userId) {
    throw new SwipeError("SELF_SWIPE", "You can't swipe on yourself");
  }

  const run = db.transaction((act: SwipeAction): SwipeResult => {
    const target = db.prepare("SELECT * FROM profiles WHERE id = ?").get(targetId) as ProfileRow | undefined;
    if (!target) throw new SwipeError("TARGET_NOT_FOUND", "Profile not found");

    const existing = db.prepare("SELECT 1 FROM swipes WHERE user_id = ? AND target_id = ?").get(userId, targetId);
    if (existing) throw new SwipeError("ALREADY_SWIPED", "You've already swiped on this profile");

    db.prepare("INSERT INTO swipes (user_id, target_id, action) VALUES (?, ?, ?)").run(userId, targetId, act);

    if (act === "like") {
      const theyLikedMe = db
        .prepare("SELECT 1 FROM swipes WHERE user_id = ? AND target_id = ? AND action = 'like'")
        .get(targetId, userId);
      if (theyLikedMe) return { matched: true, match: toPublic(target) };
    }
    return { matched: false };
  });

  try {
    return run(action);
  } catch (err) {
    // Backstop: the primary key also forbids duplicates if two requests race.
    if (err instanceof Error && "code" in err && String((err as { code: string }).code).startsWith("SQLITE_CONSTRAINT")) {
      throw new SwipeError("ALREADY_SWIPED", "You've already swiped on this profile");
    }
    throw err;
  }
}

/** Mutual likes only: the user liked them AND they liked the user. Newest first. */
export function getMatches(db: Database.Database, userId: string): MatchEntry[] {
  const rows = db
    .prepare(
      `SELECT p.*, MAX(mine.created_at, theirs.created_at) AS matched_at
       FROM swipes mine
       JOIN swipes theirs ON theirs.user_id = mine.target_id AND theirs.target_id = mine.user_id
       JOIN profiles p ON p.id = mine.target_id
       WHERE mine.user_id = ? AND mine.action = 'like' AND theirs.action = 'like'
       ORDER BY matched_at DESC, mine.rowid DESC`
    )
    .all(userId) as (ProfileRow & { matched_at: string })[];

  return rows.map((r) => ({ ...toPublic(r), matchedAt: r.matched_at }));
}
