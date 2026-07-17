# Grubbuds frontend

React + Vite frontend for Grubbuds, wired to the Express API in the repo root
(no mock data - every screen reads/writes through the real `/spots`, `/logs`,
`/users` endpoints).

## Running locally

1. Make sure the backend is running first (see the root [README](../README.md)):
   Postgres via `docker compose up -d`, migrated, seeded, and
   `npm run dev` from the repo root (listens on `http://localhost:3000`).

2. Install and start the frontend:

   ```bash
   cd frontend
   cp .env.example .env   # VITE_API_URL defaults to http://localhost:3000
   npm install
   npm run dev
   ```

   Opens on `http://localhost:5173`.

## Structure

```
src/
  api/            fetch wrappers, one file per resource (spots/logs/users)
  lib/
    currentUser.js  hardcoded fake user id (matches backend's fakeUser middleware)
    ratings.js      client-side aggregation of logs into fork-rating stats
  hooks/          data-fetching hooks built on api/ (useSpots, useSpot, useLogsForSpot, useFeedLogs)
  components/
    layout/       NavBar, SegmentedSearchBar, FilterPills
    spots/        ForkRating, ForkIcon, VisitStamp, SpotCard, SpotGrid, PlaceholderPhoto
    logs/         ForkRatingPicker, LogVisitModal
    common/       Modal, Button
  pages/          FeedPage, SpotPage (routed in App.jsx)
  styles/         tokens.css (design system variables), global.css
```

Adding the next page (e.g. Profile/Diary) means: a new file under `pages/`,
a new `<Route>` in `App.jsx`, and reusing whatever's already in `components/`.

## Decisions flagged for review

- **Ratings/log counts are computed client-side** from raw `/logs` rows
  (`lib/ratings.js`), since there's no aggregate endpoint on the backend yet.
  Fine at current data volumes; if the log table grows, move this to a
  `GROUP BY` on the backend instead.
- **"Trusted by friends"** search segment is present in the UI but disabled -
  the backend has a `follows` table but no routes, and there's only one fake
  user right now, so there's nothing to wire it to yet.
- **"Trending" filter pill** is a client-side proxy: it clears the category
  filter and sorts the grid by log count instead of a real trending signal.
- **Photo URL in the Log-a-Visit modal is a plain text input**, not a file
  picker - the backend has no upload endpoint yet, just a `photo_url` column.
- **Filter pill categories** (`cafe`, `bakery`, `restaurant`, `bar`) assume
  `spots.category` values are lowercase singular strings, matching how the
  seed data was written. There's no enum enforced on the backend, so any
  mismatch between real data entry and these values needs to be reconciled
  by hand for now.
