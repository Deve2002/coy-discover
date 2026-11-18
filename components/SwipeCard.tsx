"use client";

import { motion, useMotionValue, useTransform, type PanInfo, type Variants } from "framer-motion";
import type { PublicProfile, SwipeAction } from "@/lib/types";
import { dragDecision } from "@/lib/swipe-gesture";

// The card flies off in the direction of the decision (custom = 1 for right, -1 for left).
const variants: Variants = {
  exit: (dir: 1 | -1) => ({ x: dir * 520, rotate: dir * 18, opacity: 0, transition: { duration: 0.28 } }),
};

interface Props {
  profile: PublicProfile;
  isTop: boolean;
  custom: 1 | -1;
  onDecide: (action: SwipeAction, dir: 1 | -1) => void;
}

export default function SwipeCard({ profile, isTop, custom, onDecide }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const action = dragDecision(info.offset.x, info.velocity.x);
    if (action) onDecide(action, action === "like" ? 1 : -1);
  }

  return (
    <motion.article
      className="card"
      custom={custom}
      variants={variants}
      exit="exit"
      initial={false}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 14 }}
      style={{ x, rotate, zIndex: isTop ? 2 : 1 }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      aria-hidden={!isTop}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="card-photo" src={profile.photoUrl} alt={`${profile.name}`} draggable={false} />
      <motion.span className="stamp stamp-like" style={{ opacity: likeOpacity }}>Like</motion.span>
      <motion.span className="stamp stamp-pass" style={{ opacity: passOpacity }}>Pass</motion.span>
      <div className="card-info">
        <h2>
          {profile.name}, <span>{profile.age}</span>
        </h2>
        <p className="card-where">{profile.location}</p>
        <p className="card-bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
