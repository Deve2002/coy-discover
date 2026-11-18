"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { PublicProfile } from "@/lib/types";

interface Props {
  profile: PublicProfile;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export default function MatchScreen({ profile, onKeepSwiping, onViewMatches }: Props) {
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onKeepSwiping();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKeepSwiping]);

  return (
    <motion.div
      className="match-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="match-photo-wrap"
        initial={{ scale: 0.6, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="match-photo" src={profile.photoUrl} alt={profile.name} />
      </motion.div>
      <h2 id="match-title">It&rsquo;s a match!</h2>
      <p>
        You and {profile.name} liked each other.
      </p>
      <div className="match-actions">
        <button ref={primary} className="btn btn-primary" onClick={onViewMatches}>
          View matches
        </button>
        <button className="btn btn-ghost" onClick={onKeepSwiping}>
          Keep swiping
        </button>
      </div>
    </motion.div>
  );
}
