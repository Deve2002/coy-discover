import { getDb } from "@/lib/db";
import { CURRENT_USER_ID } from "@/lib/constants";
import { recordSwipe, SwipeError } from "@/lib/swipe-service";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

/** POST /swipe — body: { targetId: string, action: "like" | "pass" }. Returns { matched, match? }. */
export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: { code: "INVALID_JSON", message: "Body must be valid JSON" } }, { status: 400 });
    }
    const { targetId, action } = (body ?? {}) as { targetId?: unknown; action?: unknown };
    if (typeof targetId !== "string") {
      throw new SwipeError("TARGET_NOT_FOUND", "targetId is required");
    }
    return Response.json(recordSwipe(getDb(), CURRENT_USER_ID, targetId, action));
  } catch (err) {
    return errorResponse(err);
  }
}
