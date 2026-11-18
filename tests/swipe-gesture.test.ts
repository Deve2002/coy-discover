import { describe, it, expect } from "vitest";
import { dragDecision } from "@/lib/swipe-gesture";

describe("dragDecision", () => {
  it("likes on a long drag right and passes on a long drag left", () => {
    expect(dragDecision(150, 0)).toBe("like");
    expect(dragDecision(-150, 0)).toBe("pass");
  });
  it("snaps back on a short, slow drag", () => {
    expect(dragDecision(60, 100)).toBeNull();
    expect(dragDecision(-60, -100)).toBeNull();
  });
  it("accepts a quick flick even over a short distance", () => {
    expect(dragDecision(60, 900)).toBe("like");
    expect(dragDecision(-60, -900)).toBe("pass");
  });
  it("ignores a fast twitch that barely moved", () => {
    expect(dragDecision(10, 900)).toBeNull();
  });
});
