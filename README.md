# Coy Discover

A swipe-based **Discover** tab built for the Coy SDE intern assignment. It sits next to a blank **Home** tab, and keeps Coy's core promise: **nobody can find out who liked them unless the like is mutual.**

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Framer Motion. Mobile-first.
- **Backend:** Next.js API routes with a small, framework-free service layer.
- **Data:** SQLite (`better-sqlite3`), stored in `data/coy.db`.
- **Tests:** Vitest (33 tests).

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
npm run seed     # creates data/coy.db with 36 profiles (optional: it also seeds itself on first run)
npm run dev      # http://localhost:3000
npm test
```

Open it in a phone-sized viewport (browser dev tools, device mode) for the full effect.

**Try the demo**

1. In Discover, swipe right (drag, buttons, or the right-arrow key) to like; swipe left (or the left-arrow key) to pass.
2. 11 of the 36 profiles have already liked you. Like one of them and you get **It's a match!**.
3. Open the **Matches** tab to see mutual matches. Reload the page: everything persists.
4. Swipe through everyone to see the empty state.
5. Reset the demo at any time with `npm run reset` (wipes all swipes and reseeds).

## Features

| Requirement | How it works |
|---|---|
| 30+ mock profiles | 36 profiles with name, age, photo, bio, city or college, and interests. Photos are generated SVG avatars, so there are no external image dependencies. |
| Some already like you | 11 seeded profiles have a stored like on the logged-in user, so a right swipe on them is a match. |
| Swipe cards | Drag gestures on touch and mouse, plus Like and Pass buttons and arrow keys. LIKE and PASS stamps appear while dragging, and the card flies off in the direction of the decision. |
| Never shown twice | Every swipe is stored. The feed excludes anything already swiped, and the database forbids a second swipe on the same person. |
| Empty state | "You're all caught up", with links to Matches and a refresh. |
| Matching | A match exists only when both people liked each other. A full-screen "It's a match!" appears the moment a like completes a mutual pair. |
| Matches view | Lists mutual matches, newest first, with a count badge. |
| Persistence | Swipes live in SQLite, so they survive reloads and server restarts. |

## API

The assignment's paths work directly (`/feed`, `/swipe`, `/matches`). They are rewrites of the real routes under `/api/*`.

### `GET /feed`
Profiles the user has not swiped on yet. Optional `?limit=N`.

```json
{ "profiles": [ { "id": "p09", "name": "Arjun", "age": 26, "photoUrl": "/avatars/p09.svg",
                  "bio": "...", "location": "Hyderabad", "interests": ["Coding", "Biryani"] } ] }
```

### `POST /swipe`
Body: `{ "targetId": "p01", "action": "like" | "pass" }`

```json
{ "matched": false }
{ "matched": true, "match": { "id": "p01", "name": "Aarav", "...": "..." } }
```

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_ACTION` | action is not `like` or `pass` |
| 400 | `SELF_SWIPE` | swiping on yourself |
| 400 | `INVALID_JSON` | body isn't JSON |
| 404 | `TARGET_NOT_FOUND` | unknown or missing `targetId` |
| 409 | `ALREADY_SWIPED` | this person was already swiped on; the first decision stands |

Errors look like `{ "error": { "code": "ALREADY_SWIPED", "message": "..." } }`.

### `GET /matches`
Mutual matches only, newest first. Each entry is a profile plus `matchedAt`.

## How the privacy promise is enforced

This is the core of the design, so it is enforced in several independent places and covered by tests.

1. **One public shape.** Profiles leave the server only as `PublicProfile` (`lib/types.ts`), built field by field in `toPublic`. The type has no field about likes, so a like cannot leak through a forgotten column.
2. **Feed order reveals nothing.** The order depends only on a hash of the profile id, never on who liked you. Profiles that liked you are not bunched at the front.
3. **Identical responses.** A pass on someone who liked you returns exactly `{ "matched": false }`, the same as a pass on anyone else. A like that doesn't create a match returns the same.
4. **Matches are derived, not stored.** A match is "I liked them AND they liked me", computed in one query. A one-sided like can never appear in `/matches`, and no separate table can fall out of sync.
5. **No client-side secrets.** The seed data and the raw likes table stay on the server; the browser only ever receives the shapes above.

## Design decisions and trade-offs

- **SQLite over a JSON file.** Constraints enforce the rules (primary key on `(user_id, target_id)`, `CHECK` on action), writes are transactional, and there are no read-modify-write races. The trade-off is a native dependency; it needs a prebuilt binary or a compiler.
- **Service layer separate from HTTP.** `lib/swipe-service.ts` takes a database and returns plain data, so the rules are unit-tested without starting a server. The route files only parse input and shape responses.
- **Optimistic UI.** The next card shows immediately while the swipe saves in the background. If saving fails, the card returns to the front and a message appears, so no decision is lost silently.
- **Double-tap guard.** A short lock prevents a double tap from skipping a profile nobody has seen.
- **Single user.** There's no auth, per the brief: `lib/constants.ts` defines one logged-in user, `me`. Every service function takes a `userId`, so adding real auth later means changing where that value comes from.

## Tests

`npm test` runs 33 tests:

- **Seed data:** counts, required fields, idempotent reseed, duplicate swipe rejected by the database.
- **Service layer:** feed exclusion, empty feed, match creation, matches ordering, validation errors, persistence across a database close and reopen.
- **Privacy:** no like-related fields in responses, feed order independent of likes, passes indistinguishable, one-sided likes never listed.
- **HTTP layer:** routes called with real `Request` objects, including bad JSON and duplicate swipes.
- **Gestures:** the drag-to-decision rules.

## Project structure

```
app/            Next.js pages, API routes (app/api/feed, swipe, matches), global styles
components/     TabShell, Discover, SwipeCard, MatchScreen, MatchesView
lib/            swipe-service (the rules), db, schema.sql, types, seed data, gesture rules, API client
scripts/        seed.mjs (create, seed, and reset the demo database)
tests/          Vitest suites
```

## Known limitations and next steps

- No authentication or multiple users, as specified.
- Tested with mouse and keyboard; gestures follow standard pointer events, and a pass on a real phone is still worth doing.
- With more time: an undo for the last swipe, a push-style notification when a like turns into a match later, paginating the feed for large profile sets, and end-to-end browser tests.
