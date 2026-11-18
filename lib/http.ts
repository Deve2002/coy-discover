import { SwipeError } from "./swipe-service";

/** Consistent JSON error shape: { error: { code, message } }. */
export function errorResponse(err: unknown): Response {
  if (err instanceof SwipeError) {
    return Response.json({ error: { code: err.code, message: err.message } }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
}
