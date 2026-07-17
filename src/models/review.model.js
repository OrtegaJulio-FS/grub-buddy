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

module.exports = { create, findBySpotId, findById, update };
