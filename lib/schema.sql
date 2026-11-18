-- One table for every person in the app, including the logged-in user ('me').
CREATE TABLE IF NOT EXISTS profiles (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  age            INTEGER NOT NULL CHECK (age >= 18),
  photo_url      TEXT NOT NULL,
  bio            TEXT NOT NULL,
  location       TEXT NOT NULL,          -- city or college
  interests_json TEXT NOT NULL           -- JSON array of strings
);

-- Every like or pass, by anyone. A person can swipe on another person only once.
-- A match is NOT stored: it is derived (A liked B AND B liked A), so it can never drift out of sync.
CREATE TABLE IF NOT EXISTS swipes (
  user_id    TEXT NOT NULL REFERENCES profiles(id),
  target_id  TEXT NOT NULL REFERENCES profiles(id),
  action     TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, target_id),
  CHECK (user_id <> target_id)
);

-- Speeds up the reverse lookup used for match detection ("did they like me?").
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_id, action);
