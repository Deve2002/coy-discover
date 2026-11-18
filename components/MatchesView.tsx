import type { MatchEntry } from "@/lib/types";

export default function MatchesView({ matches }: { matches: MatchEntry[] | null }) {
  if (matches === null) return <div className="state">Loading matches&hellip;</div>;
  if (matches.length === 0) {
    return (
      <div className="state">
        <h2>No matches yet</h2>
        <p>A match appears here only when you and someone else both liked each other.</p>
      </div>
    );
  }
  return (
    <ul className="match-grid">
      {matches.map((m) => (
        <li key={m.id} className="match-tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.photoUrl} alt={m.name} />
          <div>
            <strong>
              {m.name}, {m.age}
            </strong>
            <span>{m.location}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
