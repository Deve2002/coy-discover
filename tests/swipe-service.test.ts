import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDatabase } from "@/lib/db";
import { seedDatabase } from "@/lib/seed.mjs";
import { CURRENT_USER_ID as ME } from "@/lib/constants";
import { getFeed, getMatches, recordSwipe, SwipeError } from "@/lib/swipe-service";

// p01 and p04 have already liked "me" in the seed data; p02 and p03 have not.
const LIKER = "p01";
const LIKER_2 = "p04";
const NON_LIKER = "p02";
const NON_LIKER_2 = "p03";

let db: ReturnType<typeof openDatabase>;
beforeEach(() => {
  db = openDatabase(":memory:");
  seedDatabase(db);
});

function errorOf(fn: () => unknown): SwipeError {
  try {
    fn();
  } catch (e) {
    return e as SwipeError;
  }
  throw new Error("expected function to throw");
}

describe("getFeed", () => {
  it("returns every profile except the user at the start", () => {
    const feed = getFeed(db, ME);
    expect(feed).toHaveLength(36);
    expect(feed.find((p) => p.id === ME)).toBeUndefined();
  });

  it("never shows a profile again after a like or a pass", () => {
    recordSwipe(db, ME, NON_LIKER, "like");
    recordSwipe(db, ME, NON_LIKER_2, "pass");
    const ids = getFeed(db, ME).map((p) => p.id);
    expect(ids).not.toContain(NON_LIKER);
    expect(ids).not.toContain(NON_LIKER_2);
    expect(ids).toHaveLength(34);
  });

  it("empties out once every profile has been swiped", () => {
    for (const p of getFeed(db, ME)) recordSwipe(db, ME, p.id, "pass");
    expect(getFeed(db, ME)).toEqual([]);
  });

  it("respects a limit", () => {
    expect(getFeed(db, ME, 5)).toHaveLength(5);
  });
});

describe("privacy: who liked you is never revealed unless mutual", () => {
  it("exposes only the public profile fields, with nothing about likes", () => {
    const [first] = getFeed(db, ME);
    expect(Object.keys(first).sort()).toEqual(
      ["age", "bio", "id", "interests", "location", "name", "photoUrl"].sort()
    );
    expect(JSON.stringify(getFeed(db, ME)).toLowerCase()).not.toMatch(/like|crush|admir/);
  });

  it("orders the feed the same whether or not people liked you", () => {
    const before = getFeed(db, ME).map((p) => p.id);
    db.prepare("DELETE FROM swipes WHERE target_id = ?").run(ME); // nobody likes me any more
    const after = getFeed(db, ME).map((p) => p.id);
    expect(after).toEqual(before);
  });

  it("does not put people who liked you at the front of the feed", () => {
    const likers = new Set(
      (db.prepare("SELECT user_id FROM swipes WHERE target_id = ?").all(ME) as { user_id: string }[]).map((r) => r.user_id)
    );
    const firstFive = getFeed(db, ME, 5).map((p) => p.id);
    expect(firstFive.every((id) => likers.has(id))).toBe(false);
  });

  it("makes a pass look identical whether or not that person had liked you", () => {
    const a = recordSwipe(db, ME, LIKER, "pass");
    const b = recordSwipe(db, ME, NON_LIKER, "pass");
    expect(a).toEqual(b);
    expect(a).toEqual({ matched: false });
  });

  it("makes a non-matching like look identical to a pass", () => {
    expect(recordSwipe(db, ME, NON_LIKER, "like")).toEqual({ matched: false });
  });

  it("never lists someone in matches just because they liked you", () => {
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("never lists someone in matches just because you liked them", () => {
    recordSwipe(db, ME, NON_LIKER, "like");
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("does not match if you passed on someone who liked you", () => {
    recordSwipe(db, ME, LIKER, "pass");
    expect(getMatches(db, ME)).toEqual([]);
  });
});

describe("matching", () => {
  it("creates a match when you like someone who already liked you", () => {
    const result = recordSwipe(db, ME, LIKER, "like");
    expect(result.matched).toBe(true);
    expect(result.match?.id).toBe(LIKER);
    expect(result.match?.name).toBeTruthy();
  });

  it("lists mutual matches, newest first", () => {
    recordSwipe(db, ME, LIKER, "like");
    recordSwipe(db, ME, NON_LIKER, "like"); // not mutual
    recordSwipe(db, ME, LIKER_2, "like");
    const ids = getMatches(db, ME).map((m) => m.id);
    expect(ids).toEqual([LIKER_2, LIKER]);
  });

  it("also matches if the other person's like arrives later", () => {
    recordSwipe(db, ME, NON_LIKER, "like");
    expect(getMatches(db, ME)).toEqual([]);
    // They like you back afterwards. The match is derived, so it simply appears.
    db.prepare("INSERT INTO swipes (user_id, target_id, action) VALUES (?, ?, 'like')").run(NON_LIKER, ME);
    expect(getMatches(db, ME).map((m) => m.id)).toEqual([NON_LIKER]);
  });
});

describe("swipe validation", () => {
  it("rejects an unknown action", () => {
    const e = errorOf(() => recordSwipe(db, ME, NON_LIKER, "superlike"));
    expect([e.code, e.status]).toEqual(["INVALID_ACTION", 400]);
  });

  it("rejects an unknown profile", () => {
    const e = errorOf(() => recordSwipe(db, ME, "nobody", "like"));
    expect([e.code, e.status]).toEqual(["TARGET_NOT_FOUND", 404]);
  });

  it("rejects swiping on yourself", () => {
    const e = errorOf(() => recordSwipe(db, ME, ME, "like"));
    expect([e.code, e.status]).toEqual(["SELF_SWIPE", 400]);
  });

  it("rejects a second swipe on the same person and keeps the first decision", () => {
    recordSwipe(db, ME, LIKER, "pass");
    const e = errorOf(() => recordSwipe(db, ME, LIKER, "like"));
    expect([e.code, e.status]).toEqual(["ALREADY_SWIPED", 409]);
    expect(getMatches(db, ME)).toEqual([]); // the pass stands; no sneaky match
  });
});

describe("persistence", () => {
  it("keeps swipes and matches after the database is closed and reopened", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "test.db");
    const first = openDatabase(file);
    seedDatabase(first);
    recordSwipe(first, ME, LIKER, "like");
    recordSwipe(first, ME, NON_LIKER, "pass");
    first.close();

    const second = openDatabase(file);
    expect(getMatches(second, ME).map((m) => m.id)).toEqual([LIKER]);
    const feedIds = getFeed(second, ME).map((p) => p.id);
    expect(feedIds).not.toContain(LIKER);
    expect(feedIds).not.toContain(NON_LIKER);
    second.close();
  });
});
