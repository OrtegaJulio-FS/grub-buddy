# Grubbuds

Backend for Grubbuds — a social discovery app for local spots ("Letterboxd for
restaurants/cafés"). Users log visits, rate spots (required 1-5 forks), write
reviews, follow each other, build curated lists, and see an activity feed of
what people they follow are up to.

## Stack

- Node.js + Express
- PostgreSQL (via `pg`, raw SQL - no ORM)
- JWT auth (`jsonwebtoken` + `bcrypt`), wired up separately from the core routes
- Cloudinary for image uploads (spot photos, avatars)
- Jest + Supertest for tests, against a real Postgres test database

## Project structure

```
migrations/        # node-pg-migrate migrations (versioned schema changes)
db/
  seed.sql/seed.js  # seeds the fake user (id=1) plus 3 more users with
                    # logs/reviews/follows between them, for real social data
tests/              # jest + supertest, against a real (separate) test database
  globalSetup.js    # creates + migrates the test database once per run
  setup-env.js      # loads .env.test before any test file's requires
  db.js             # resetDb() - truncate + reseed baseline users
  helpers.js        # agentAs() - a supertest agent pre-authenticated as a given user
  *.test.js
src/
  config/          # pg Pool, Cloudinary client
  middleware/
    auth.js        # real JWT middleware (requireAuth), reads the httpOnly cookie
    upload.js       # multer (in-memory) for image uploads
  utils/
    ownership.js   # isOwnedBy() - shared ownership check for controllers
    validation.js  # shared input validation (email, pagination, dates, ratings)
  models/          # raw SQL queries per table
  controllers/     # request handling, one per resource
  routes/          # route -> controller wiring
  app.js           # express app, middleware, route mounting
  server.js        # entrypoint
```

## Running locally

1. **Start Postgres** (via Docker, no local install needed):

   ```bash
   docker compose up -d
   ```

   This starts Postgres 16 on `localhost:5432` with user/password/db all set
   to `grubbuds` (see `docker-compose.yml`).

2. **Configure environment**:

   ```bash
   cp .env.example .env
   ```

   The default `DATABASE_URL` in `.env.example` already matches the Docker
   Compose credentials, so no edits are needed for local dev. Do replace
   `JWT_SECRET` with a real random value (`openssl rand -base64 48`) before
   using the auth routes.

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Apply migrations**:

   ```bash
   npm run db:migrate
   ```

   Runs [node-pg-migrate](https://github.com/salsita/node-pg-migrate) against
   `migrations/`. The first migration (`baseline`) captures the schema as it
   stood under the old `schema.sql` approach; everything after that is a
   normal versioned migration (`npm run db:migrate:create -- some_name` to
   add one, `npm run db:migrate:down` to roll back the most recent one).

5. **Seed the database** (4 real, login-able users with their own
   logs/reviews/follows so social features have real data to show):

   ```bash
   node db/seed.js
   ```

   All four seeded users share the password `password123`:

   | Name       | Email                | Password      |
   |------------|-----------------------|---------------|
   | Test User  | test@grubbuds.dev     | password123   |
   | Priya Nair | priya@grubbuds.dev    | password123   |
   | Marcus Webb| marcus@grubbuds.dev   | password123   |
   | Dana Osei  | dana@grubbuds.dev     | password123   |

   Log in as any of them at `POST /auth/login` (or the frontend's Login page)
   to test the app as that user.

6. **(Optional) Enable image uploads** - see
   [Image uploads (Cloudinary)](#image-uploads-cloudinary) below. The API
   runs fine without this; `POST /uploads` just returns a 503 until it's set up.

7. **Run the server**:

   ```bash
   npm run dev   # nodemon, restarts on file changes
   # or
   npm start
   ```

   Server listens on `http://localhost:3000` by default (`PORT` in `.env`).

## Running tests

```bash
cp .env.test.example .env.test   # separate DB so tests can freely TRUNCATE
npm test
```

Jest + Supertest against a real Postgres database (`grubbuds_test` by
default - same Postgres instance from `docker compose up -d` is fine, it's
just a different database name so test runs never touch your dev data).
`tests/globalSetup.js` creates and migrates that database automatically the
first time; `tests/db.js`'s `resetDb()` truncates every table and reseeds
two baseline users before each test, so tests are isolated and order
doesn't matter (except within `tests/auth.test.js`, where the rate-limit
test intentionally runs last since it exhausts the limiter).

Coverage priorities: the core loop (spot → log → server-side aggregate
correctness), every ownership check (owner succeeds, non-owner 403), auth
(signup/login, bad password, rate limiting), the transactional log+review
endpoint including rollback on a forced mid-transaction failure, and
validation rejections (bad ratings, non-numeric pagination params, future
`visited_at`).

## API overview

Every route below (except `/auth/signup`, `/auth/login`, and `/auth/logout`)
requires a real logged-in user - `middleware/auth.js`'s `requireAuth` reads
the JWT from an httpOnly cookie and populates `req.user`, returning `401` if
it's missing or invalid.

- **Users** - `GET/POST /users`, `GET/PUT/DELETE /users/:id`
- **Spots** - `GET/POST /spots`, `GET/PUT/DELETE /spots/:id`
  (`GET /spots?city=&category=&minRating=&search=`), `GET /spots/trending`
- **Logs** - `GET/POST /logs`, `GET/PUT/DELETE /logs/:id`
  (`GET /logs?userId=&spotId=`)
- **Reviews** - `GET /spots/:id/reviews`, `POST /reviews`, `PATCH /reviews/:id`
- **Follows** - `POST /follows`, `DELETE /follows/:userId`,
  `GET /users/:id/followers`, `GET /users/:id/following`,
  `GET /users/:id/is-following/:targetId`, `GET /users/:id/overlap/:otherId`
- **Activity** - `GET /activity` (merged logs+reviews from followed users)
- **Lists** - `GET/POST /lists`, `GET/PATCH/DELETE /lists/:id`,
  `POST/DELETE /lists/:id/items[/:spotId]`, `GET /users/:id/lists`
- **Uploads** - `POST /uploads` (multipart `image` field, optional `folder`
  of `avatars` or `spots`) → `{ url, publicId }`

`POST /logs` requires `spotId` and an integer `rating` 1-5; everything else
across these routes follows the same required/optional split you'd expect.

### Auth

- `POST /auth/signup` - `{ name, email, password, bio?, avatarUrl?, city? }` →
  `{ user }`, and sets the JWT as an httpOnly cookie
- `POST /auth/login` - `{ email, password }` → `{ user }`, same cookie
- `POST /auth/logout` - clears the cookie, `204`
- `GET /auth/me` - requires the cookie, returns the current user (`401` if
  not logged in) - used by the frontend on load to restore a session

The JWT never appears in a response body or is readable by JS - it's
`httpOnly`, `sameSite: lax`, and `secure` in production (see
`src/utils/cookies.js`). The frontend must send `credentials: 'include'` on
every request for the cookie to round-trip.

## Image uploads (Cloudinary)

`POST /uploads` streams an image straight to Cloudinary (never touches disk)
and returns its `secure_url`. To enable it:

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is plenty
   for development).
2. From the [console dashboard](https://console.cloudinary.com/console), copy
   your **Cloud name**, **API Key**, and **API Secret**.
3. Set them in `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

Without these set, `POST /uploads` returns `503` rather than crashing - the
rest of the app works fine either way. The API secret is server-side only;
never put it in the frontend's `.env`.

## Deployment (Render)

`render.yaml` at the repo root is a
[Render Blueprint](https://render.com/docs/infrastructure-as-code) defining
the API as a web service plus a managed Postgres database.

1. Push this repo to GitHub, then in Render: **New > Blueprint**, point it at
   the repo. Render reads `render.yaml` and provisions both the web service
   and the `grubbuds-db` database.
2. `DATABASE_URL` and `JWT_SECRET` are wired up automatically by the
   blueprint. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
   `CLOUDINARY_API_SECRET` manually in the Render dashboard (Environment tab)
   - they're marked `sync: false` so they're never committed.
3. After the first deploy, run the schema against the production database
   once (Render's shell, or `DATABASE_URL=<prod-url> npm run db:migrate`
   from your machine). Seeding production with the dev fake users is
   optional and probably not what you want for a real deploy.

This config is here so deploying is a few clicks when you're ready - nothing
above actually deploys anything by itself.

## Decisions flagged for review

- **IDs are auto-incrementing integers (`BIGSERIAL`), not UUIDs.** Simpler and
  faster to work with for now; switch later if you need non-guessable public
  IDs (e.g. so spot/user IDs in a shared link don't reveal row counts).
- **`reviews.log_id` is `UNIQUE`** - one review per log, treating a review as
  an optional long-form extension of a log's required rating. Drop the
  constraint if a log should support multiple reviews.
- **`reviews.tags` is a Postgres `TEXT[]`**, not a separate tags table. Simple
  for MVP; revisit if you need tag search/autocomplete/analytics.
- **`logs.visited_at` is a `TIMESTAMPTZ` defaulting to `now()`**, not a plain
  date. Lets a log optionally record a specific visit time, but you can pass
  just a date string and Postgres will coerce it.
- **`follows` has no surrogate `id`** - `(follower_id, followed_id)` is the
  primary key, since that pair is already the natural unique constraint.
- **`lists.is_public` has no visibility enforcement** - now that real
  multi-user auth exists, a private list is still readable by anyone who
  knows its id. The column drives the UI toggle only; add a check in
  `lists.controller.js` if private lists need to actually be hidden from
  non-owners.
- **`GET /spots/trending` still returns all-time `average_rating`/`log_count`**
  for display consistency with every other spot listing - only the ranking
  (`recent_log_count`, last 7 days) is time-boxed.
- **Uploads always go to one of two fixed Cloudinary folders** (`grubbuds/avatars`
  or `grubbuds/spots`) based on a `folder` field in the request, not a
  per-user/per-spot path. Fine at this scale; revisit if uploads need to be
  individually deletable/auditable later.
