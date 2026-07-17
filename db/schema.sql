-- Grubbuds schema
-- Design decisions (flagged for course-correction):
--   * IDs are BIGSERIAL (auto-incrementing integers), not UUIDs. Simpler and faster
--     for an MVP; switch to UUID later if you need non-guessable public IDs.
--   * Every table has created_at; users/spots/lists also get updated_at.
--   * rating uses SMALLINT with a CHECK constraint (1-5) rather than an ENUM.
--   * reviews.log_id is UNIQUE, meaning one review per log (a review is treated as
--     an optional "long form" extension of a log's rating). Drop the UNIQUE if you
--     want multiple reviews per log.
--   * reviews.tags is a native Postgres TEXT[] array for MVP simplicity instead of
--     a separate tags/join table. Fine until you need tag search/autocomplete at scale.
--   * follows has no surrogate id - the composite (follower_id, followed_id) is the
--     primary key, which is the natural unique constraint for a follow relationship.

CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  bio            TEXT,
  avatar_url     TEXT,
  city           VARCHAR(100) NOT NULL DEFAULT 'Des Moines',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spots (
  id               BIGSERIAL PRIMARY KEY,
  name             VARCHAR(200) NOT NULL,
  category         VARCHAR(100),
  address          TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  cover_photo_url  TEXT,
  created_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
  city             VARCHAR(100) NOT NULL DEFAULT 'Des Moines',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spots_city ON spots(city);
CREATE INDEX IF NOT EXISTS idx_spots_created_by ON spots(created_by);

CREATE TABLE IF NOT EXISTS logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id      BIGINT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  visited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  quick_note   TEXT,
  photo_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_spot_id ON logs(spot_id);

CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL PRIMARY KEY,
  log_id      BIGINT NOT NULL UNIQUE REFERENCES logs(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followed_id ON follows(followed_id);

CREATE TABLE IF NOT EXISTS lists (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);

CREATE TABLE IF NOT EXISTS list_items (
  list_id   BIGINT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  spot_id   BIGINT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, spot_id)
);
