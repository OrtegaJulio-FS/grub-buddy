# Grubbuds

Backend for Grubbuds — a social discovery app for local spots ("Letterboxd for
restaurants/cafés"). Users log visits, rate spots (required 1-5 forks), follow
each other, and build curated lists.

## Stack

- Node.js + Express
- PostgreSQL (via `pg`, raw SQL - no ORM)
- JWT auth (`jsonwebtoken` + `bcrypt`), wired up separately from the core routes

## Project structure

```
db/
  schema.sql       # full table definitions
  migrate.js       # applies schema.sql
  seed.sql/seed.js # seeds the fake user used by the no-auth routes
src/
  config/db.js     # pg Pool
  middleware/
    fakeUser.js    # hardcoded user, used by /users /spots /logs for now
    auth.js        # real JWT middleware (requireAuth) - not wired in yet
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

4. **Apply the schema**:

   ```bash
   npm run db:migrate
   ```

   This is a single `schema.sql` file applied directly - there's no
   migration-history table or versioning yet. Fine while the schema is still
   moving; consider `node-pg-migrate` once it stabilizes.

5. **Seed the fake user** (needed because `/spots` and `/logs` foreign-key to
   a user row):

   ```bash
   node db/seed.js
   ```

6. **Run the server**:

   ```bash
   npm run dev   # nodemon, restarts on file changes
   # or
   npm start
   ```

   Server listens on `http://localhost:3000` by default (`PORT` in `.env`).

## API overview

### Core loop (no auth yet)

Every request to these routes is treated as the same hardcoded user
(`id: 1`, see `src/middleware/fakeUser.js`) so you can build/test the core
loop before wiring up real login.

- `GET/POST /users`, `GET/PUT/DELETE /users/:id`
- `GET/POST /spots`, `GET/PUT/DELETE /spots/:id` (`GET /spots?city=&category=`)
- `GET/POST /logs`, `GET/PUT/DELETE /logs/:id` (`GET /logs?userId=&spotId=`)

`POST /logs` requires `spotId` and an integer `rating` 1-5; everything else
is optional.

### Auth (separate track)

- `POST /auth/signup` - `{ name, email, password }` → `{ token, user }`
- `POST /auth/login` - `{ email, password }` → `{ token, user }`

These issue real JWTs today but nothing currently *requires* them.
`src/middleware/auth.js` exports `requireAuth`, ready to swap in for
`fakeUser` in `src/app.js` once you want `/users`, `/spots`, and `/logs` to
require a real logged-in user.

## Decisions flagged for review

- **IDs are auto-incrementing integers (`BIGSERIAL`), not UUIDs.** Simpler and
  faster to work with for now; switch later if you need non-guessable public
  IDs (e.g. so spot/user IDs in a shared link don't reveal row counts).
- **No migration framework** - `db/schema.sql` is applied wholesale. Once the
  schema stabilizes, move to versioned migrations (`node-pg-migrate` or similar)
  so changes can be applied incrementally to a populated database.
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
