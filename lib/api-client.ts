import type { MatchEntry, PublicProfile, SwipeAction, SwipeResult } from "./types";

export class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error?.code ?? "UNKNOWN", body?.error?.message ?? "Request failed");
  return body as T;
}

export async function fetchFeed(): Promise<PublicProfile[]> {
  return (await request<{ profiles: PublicProfile[] }>("/api/feed")).profiles;
}

export async function fetchMatches(): Promise<MatchEntry[]> {
  return (await request<{ matches: MatchEntry[] }>("/api/matches")).matches;
}

export function sendSwipe(targetId: string, action: SwipeAction): Promise<SwipeResult> {
  return request<SwipeResult>("/api/swipe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetId, action }),
  });
}
