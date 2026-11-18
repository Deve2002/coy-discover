import { getDb } from "@/lib/db";
import { CURRENT_USER_ID } from "@/lib/constants";
import { getFeed } from "@/lib/swipe-service";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic"; // never cache: the feed changes with every swipe

/** GET /feed — profiles the user has not swiped on yet. Optional ?limit=N. */
export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("limit");
    const limit = raw ? Math.min(Math.max(parseInt(raw, 10) || 0, 0), 100) : undefined;
    return Response.json({ profiles: getFeed(getDb(), CURRENT_USER_ID, limit) });
  } catch (err) {
    return errorResponse(err);
  }
}
