import { getDb } from "@/lib/db";
import { CURRENT_USER_ID } from "@/lib/constants";
import { getMatches } from "@/lib/swipe-service";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /matches — mutual matches only, newest first. */
export async function GET() {
  try {
    return Response.json({ matches: getMatches(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return errorResponse(err);
  }
}
