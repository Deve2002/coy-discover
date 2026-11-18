import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "@/lib/db";
import { seedDatabase } from "@/lib/seed.mjs";
import { CURRENT_USER_ID } from "@/lib/constants";

describe("seed data", () => {
  let db: ReturnType<typeof openDatabase>;
  beforeEach(() => {
    db = openDatabase(":memory:");
    seedDatabase(db);
  });

  it("creates at least 30 profiles besides the logged-in user", () => {
    const { n } = db.prepare("SELECT COUNT(*) n FROM profiles WHERE id <> ?").get(CURRENT_USER_ID) as { n: number };
    expect(n).toBeGreaterThanOrEqual(30);
  });

  it("gives every profile the required fields", () => {
    const rows = db.prepare("SELECT * FROM profiles WHERE id <> ?").all(CURRENT_USER_ID) as any[];
    for (const r of rows) {
      expect(r.name).toBeTruthy();
      expect(r.age).toBeGreaterThanOrEqual(18);
      expect(r.photo_url).toMatch(/^\/avatars\//);
      expect(r.bio).toBeTruthy();
      expect(r.location).toBeTruthy();
      expect(JSON.parse(r.interests_json).length).toBeGreaterThan(0);
    }
  });

  it("has some profiles that already like the logged-in user, but none that the user has swiped on", () => {
    const likesMe = db.prepare("SELECT COUNT(*) n FROM swipes WHERE target_id = ? AND action = 'like'").get(CURRENT_USER_ID) as { n: number };
    const mine = db.prepare("SELECT COUNT(*) n FROM swipes WHERE user_id = ?").get(CURRENT_USER_ID) as { n: number };
    expect(likesMe.n).toBeGreaterThan(0);
    expect(mine.n).toBe(0);
  });

  it("is safe to run twice (idempotent reset)", () => {
    expect(() => seedDatabase(db)).not.toThrow();
    const { n } = db.prepare("SELECT COUNT(*) n FROM profiles").get() as { n: number };
    expect(n).toBeGreaterThanOrEqual(31);
  });

  it("rejects a duplicate swipe on the same person", () => {
    db.prepare("INSERT INTO swipes (user_id, target_id, action) VALUES ('me','p02','pass')").run();
    expect(() => db.prepare("INSERT INTO swipes (user_id, target_id, action) VALUES ('me','p02','like')").run()).toThrow();
  });
});
