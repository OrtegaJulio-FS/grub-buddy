const pool = require('../config/db');

async function create({ logId, body, rating, tags }) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (log_id, body, rating, tags)
     VALUES ($1, $2, $3, COALESCE($4::text[], '{}'::text[]))
     RETURNING *`,
    [logId, body, rating ?? null, tags || null]
  );
  return rows[0];
}

// Reviews don't carry their own reviewer/spot columns - both come through the
// log they're attached to (logs.user_id, logs.spot_id), so every read joins
// through logs (and users, for the reviewer's name).
async function findBySpotId(spotId) {
  const { rows } = await pool.query(
    `SELECT
       reviews.id,
       reviews.log_id,
       reviews.body,
       reviews.rating,
       reviews.tags,
       reviews.created_at,
       logs.visited_at,
       logs.spot_id,
       users.id AS user_id,
       users.name AS user_name
     FROM reviews
     JOIN logs ON logs.id = reviews.log_id
     JOIN users ON users.id = logs.user_id
     WHERE logs.spot_id = $1
     ORDER BY reviews.created_at DESC`,
    [spotId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
  return rows[0];
}

// Creates the visit log and its review together in a single transaction -
// used when the reviewer doesn't already have a log for this spot to attach
// to. A single client (not the shared pool) is required so both inserts
// share one BEGIN/COMMIT; if the review insert fails, the log is rolled
// back too, rather than leaving an orphan visit behind.
async function createWithLog({ userId, spotId, visitedAt, rating, quickNote, body, tags }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: logRows } = await client.query(
      `INSERT INTO logs (user_id, spot_id, visited_at, rating, quick_note)
       VALUES ($1, $2, COALESCE($3, now()), $4, $5)
       RETURNING *`,
      [userId, spotId, visitedAt || null, rating, quickNote || null]
    );
    const log = logRows[0];

    const { rows: reviewRows } = await client.query(
      `INSERT INTO reviews (log_id, body, rating, tags)
       VALUES ($1, $2, $3, COALESCE($4::text[], '{}'::text[]))
       RETURNING *`,
      [log.id, body, rating, tags || null]
    );
    const review = reviewRows[0];

    await client.query('COMMIT');
    return { log, review };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// log_id is UNIQUE (one review per log) - correcting a review is always this
// UPDATE, never a second INSERT for the same log.
async function update(id, { body, rating, tags }) {
  const { rows } = await pool.query(
    `UPDATE reviews
     SET body = COALESCE($2, body),
         rating = COALESCE($3, rating),
         tags = COALESCE($4, tags)
     WHERE id = $1
     RETURNING *`,
    [id, body, rating, tags]
  );
  return rows[0];
}

module.exports = { create, createWithLog, findBySpotId, findById, update };
