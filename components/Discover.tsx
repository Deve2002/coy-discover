"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import type { MatchEntry, PublicProfile, SwipeAction } from "@/lib/types";
import { ApiError, fetchFeed, fetchMatches, sendSwipe } from "@/lib/api-client";
import SwipeCard from "./SwipeCard";
import MatchScreen from "./MatchScreen";
import MatchesView from "./MatchesView";

type View = "swipe" | "matches";
type Status = "loading" | "ready" | "error";

export default function Discover() {
  const [view, setView] = useState<View>("swipe");
  const [queue, setQueue] = useState<PublicProfile[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [exitDir, setExitDir] = useState<1 | -1>(1);
  const [matchedWith, setMatchedWith] = useState<PublicProfile | null>(null);
  const [matches, setMatches] = useState<MatchEntry[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const lockedUntil = useRef(0);

  const loadFeed = useCallback(async () => {
    setStatus("loading");
    try {
      setQueue(await fetchFeed());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      setMatches(await fetchMatches());
    } catch {
      setToast("Couldn't load your matches.");
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Runs on first load (for the count badge) and every time the view changes.
  useEffect(() => {
    loadMatches();
  }, [view, loadMatches]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const decide = useCallback(
    async (action: SwipeAction, dir?: 1 | -1) => {
      const now = Date.now();
      // Short lock so a double tap can't skip a profile nobody has seen.
      if (now < lockedUntil.current || queue.length === 0 || matchedWith) return;
      lockedUntil.current = now + 350;

      const profile = queue[0];
      setExitDir(dir ?? (action === "like" ? 1 : -1));
      setQueue((q) => q.slice(1)); // optimistic: next card shows immediately

      try {
        const result = await sendSwipe(profile.id, action);
        if (result.matched && result.match) {
          setMatchedWith(result.match);
          loadMatches();
        }
      } catch (err) {
        if (err instanceof ApiError && err.code === "ALREADY_SWIPED") return; // already recorded; stay removed
        setQueue((q) => [profile, ...q]); // roll back so nothing is lost
        setToast("Couldn't save that swipe. Try again.");
      }
    },
    [queue, matchedWith, loadMatches]
  );

  // Desktop keyboard: arrow keys mirror the buttons.
  useEffect(() => {
    if (view !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide("like");
      if (e.key === "ArrowLeft") decide("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, decide]);

  const visible = queue.slice(0, 2).reverse(); // top card renders last, so it sits on top
  const empty = status === "ready" && queue.length === 0;

  return (
    <MotionConfig reducedMotion="user">
      <div className="discover">
        <div className="seg" role="tablist" aria-label="Discover sections">
          <button role="tab" aria-selected={view === "swipe"} onClick={() => setView("swipe")}>
            Swipe
          </button>
          <button role="tab" aria-selected={view === "matches"} onClick={() => setView("matches")}>
            Matches{matches && matches.length > 0 ? <b className="badge">{matches.length}</b> : null}
          </button>
        </div>

        {view === "swipe" ? (
          <>
            <div className="stage">
              {status === "loading" && <div className="state">Loading profiles&hellip;</div>}
              {status === "error" && (
                <div className="state">
                  <p>Couldn&rsquo;t load profiles.</p>
                  <button className="btn btn-primary" onClick={loadFeed}>Try again</button>
                </div>
              )}
              {empty && (
                <div className="state">
                  <h2>You&rsquo;re all caught up</h2>
                  <p>You&rsquo;ve swiped on everyone for now. Check your matches, or look again later.</p>
                  <div className="match-actions">
                    <button className="btn btn-primary" onClick={() => setView("matches")}>View matches</button>
                    <button className="btn btn-ghost" onClick={loadFeed}>Look for new profiles</button>
                  </div>
                </div>
              )}
              <AnimatePresence custom={exitDir}>
                {visible.map((p) => (
                  <SwipeCard key={p.id} profile={p} isTop={p.id === queue[0].id} custom={exitDir} onDecide={decide} />
                ))}
              </AnimatePresence>
            </div>

            <div className="actions">
              <button className="round round-pass" aria-label="Pass" disabled={queue.length === 0} onClick={() => decide("pass")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <button className="round round-like" aria-label="Like" disabled={queue.length === 0} onClick={() => decide("like")}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
                </svg>
              </button>
            </div>
            <p className="privacy-note">Likes stay private until they&rsquo;re mutual.</p>
          </>
        ) : (
          <div className="matches-pane">
            <MatchesView matches={matches} />
          </div>
        )}

        {matchedWith && (
          <MatchScreen
            profile={matchedWith}
            onKeepSwiping={() => setMatchedWith(null)}
            onViewMatches={() => {
              setMatchedWith(null);
              setView("matches");
            }}
          />
        )}
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
