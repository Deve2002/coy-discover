import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Point the app at a throwaway database BEFORE the route modules are loaded.
process.env.DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-api-")), "api.db");

let feed: typeof import("@/app/api/feed/route");
let swipe: typeof import("@/app/api/swipe/route");
let matches: typeof import("@/app/api/matches/route");

beforeAll(async () => {
  feed = await import("@/app/api/feed/route");
  swipe = await import("@/app/api/swipe/route");
  matches = await import("@/app/api/matches/route");
});

const post = (body: unknown) =>
  swipe.POST(new Request("http://localhost/api/swipe", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

describe("HTTP API", () => {
  it("GET /feed returns profiles, and a swiped profile disappears", async () => {
    const before = await (await feed.GET(new Request("http://localhost/api/feed"))).json();
    expect(before.profiles.length).toBe(36);

    const res = await post({ targetId: "p02", action: "pass" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ matched: false });

    const after = await (await feed.GET(new Request("http://localhost/api/feed"))).json();
    expect(after.profiles.map((p: { id: string }) => p.id)).not.toContain("p02");
  });

  it("POST /swipe reports a match when the like is mutual, and GET /matches lists it", async () => {
    const res = await post({ targetId: "p01", action: "like" });
    const body = await res.json();
    expect(body.matched).toBe(true);
    expect(body.match.id).toBe("p01");

    const list = await (await matches.GET()).json();
    expect(list.matches.map((m: { id: string }) => m.id)).toEqual(["p01"]);
  });

  it("returns clear errors for bad requests", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post({ action: "like" })).status).toBe(404);
    expect((await post({ targetId: "p05", action: "nope" })).status).toBe(400);
    expect((await post({ targetId: "ghost", action: "like" })).status).toBe(404);
    const dup = await post({ targetId: "p01", action: "like" });
    expect(dup.status).toBe(409);
    expect((await dup.json()).error.code).toBe("ALREADY_SWIPED");
  });

  it("GET /feed never includes anything about who liked you", async () => {
    const text = JSON.stringify(await (await feed.GET(new Request("http://localhost/api/feed"))).json()).toLowerCase();
    expect(text).not.toMatch(/like|crush|admir/);
  });
});
