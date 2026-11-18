import type { SwipeAction } from "./types";

export const DISTANCE_THRESHOLD = 110; // px dragged sideways to commit
export const VELOCITY_THRESHOLD = 500; // px/s flick speed to commit
const MIN_FLICK_DISTANCE = 40; // a fast tap-and-twitch shouldn't count as a flick

/** Decide what a finished drag means: right = like, left = pass, otherwise snap back (null). */
export function dragDecision(offsetX: number, velocityX: number): SwipeAction | null {
  if (offsetX > DISTANCE_THRESHOLD || (offsetX > MIN_FLICK_DISTANCE && velocityX > VELOCITY_THRESHOLD)) return "like";
  if (offsetX < -DISTANCE_THRESHOLD || (offsetX < -MIN_FLICK_DISTANCE && velocityX < -VELOCITY_THRESHOLD)) return "pass";
  return null;
}
