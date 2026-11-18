"use client";

import { useState } from "react";

type TabId = "home" | "discover";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9.5h13V10" />
      </svg>
    ),
  },
  {
    id: "discover",
    label: "Discover",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
      </svg>
    ),
  },
];

export default function TabShell() {
  const [active, setActive] = useState<TabId>("discover");

  return (
    <div className="app">
      <main className="screen" role="tabpanel" aria-label={active}>
        {active === "home" && null /* Home stays blank by design */}
        {active === "discover" && (
          <div className="placeholder">Discover is coming in the next phase.</div>
        )}
      </main>

      <nav className="tabbar" role="tablist" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            className="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
