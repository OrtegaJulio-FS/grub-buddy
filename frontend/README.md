# Grubbuds frontend

React + Vite frontend for Grubbuds, wired to the Express API in the repo root
(no mock data - every screen reads/writes through the real API).

## Running locally

1. Make sure the backend is running first (see the root [README](../README.md)):
   Postgres via `docker compose up -d`, migrated, seeded, and
   `npm run dev` from the repo root (listens on `http://localhost:3000`).

2. Install and start the frontend:

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Opens on `http://localhost:5173`.

## Environment variables

- `VITE_API_URL` - defaults to `http://localhost:3000`, no changes needed for
  local dev.
- `VITE_MAPBOX_TOKEN` - required for the Map view on the Feed page (Grid/Map
  toggle). Get a free public token (starts with `pk.`) from
  [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/).
  Mapbox public tokens are meant to ship in client-side code, unlike
  Cloudinary's API secret (backend-only, see the root README). Without this
  set, Map view shows a clear placeholder instead of crashing.

## Structure

```
src/
  api/            fetch wrappers, one file per resource (spots/logs/users/
                  reviews/follows/activity/lists/uploads)
  lib/
    currentUser.js  hardcoded fake user id (matches backend's fakeUser middleware)
    format.js       date formatting
    profile.js      derives a display-only @handle (no username column yet)
    tags.js         shared review tag vocabulary
  hooks/          data-fetching hooks built on api/ - one per resource/query
  components/
    layout/       NavBar, SegmentedSearchBar, FilterPills, RatingFilter
    spots/        ForkRating, ForkIcon, VisitStamp, SpotCard, SpotGrid, PlaceholderPhoto
    logs/         ForkRatingPicker, LogVisitModal
    reviews/      ReviewCard, ReviewsList, TagPicker, WriteReviewModal
    profile/      ProfileHeader, Avatar's callers, FollowButton, EditProfileModal,
                  TopSpots, ListsSection, DiaryList
    activity/     ActivityItem, ActivityFeed
    lists/        CreateListModal, AddToListModal, ListCard
    map/          MapView (Mapbox GL)
    common/       Modal, Button, Avatar
  pages/          FeedPage, SpotPage, ProfilePage, ActivityPage, ListPage
                  (routed in App.jsx)
  styles/         tokens.css (design system variables), global.css
```

Adding a new page means: a new file under `pages/`, a new `<Route>` in
`App.jsx`, and reusing whatever's already in `components/`.

## Deployment (Vercel)

`vercel.json` configures the build (`npm run build` → `dist/`) and rewrites
all routes to `index.html` so React Router's client-side routes work on
refresh/direct link.

1. Push this repo to GitHub, then in Vercel: **New Project**, point it at the
   repo with **Root Directory** set to `frontend/`.
2. Set `VITE_API_URL` (your deployed backend's URL) and `VITE_MAPBOX_TOKEN`
   as Environment Variables in the Vercel project settings - `vercel.json`
   intentionally doesn't hardcode these since they differ per environment.
3. Deploy. Nothing here deploys automatically by itself - this is just the
   config so it's a few clicks when you're ready.

## Decisions flagged for review

- **Ratings/log counts are computed server-side** (`average_rating`/`log_count`
  on every spot from `GET /spots`), *not* aggregated client-side - this
  changed in Phase 3; there's no `lib/ratings.js` anymore.
- **"Trusted by friends"** and **"Trending"** are both real now (Phase 5 and
  Phase 7 respectively) - not client-side proxies anymore.
- **Photo URL in the Log-a-Visit modal is still a plain text input**, not a
  file picker - only the avatar upload (Edit Profile) and spot photos
  (seeded, not user-uploaded yet) use the Cloudinary pipeline so far.
- **Filter pill categories** (`cafe`, `bakery`, `restaurant`, `bar`) assume
  `spots.category` values are lowercase singular strings, matching how the
  seed data was written. There's no enum enforced on the backend, so any
  mismatch between real data entry and these values needs to be reconciled
  by hand for now.
- **"Add to list" membership is checked with one request per list** when the
  modal opens (no bulk "which lists have this spot" endpoint) - fine for a
  handful of lists per user, worth a backend endpoint if that grows.
- **Reviewer/activity avatars don't show uploaded photos** - those queries
  don't select `avatar_url` yet, so they fall back to the initial-based
  circle even after a user uploads a real avatar via Edit Profile.
