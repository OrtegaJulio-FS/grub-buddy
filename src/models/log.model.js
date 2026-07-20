const pool = require('../config/db');

async function create({ userId, spotId, visitedAt, rating, quickNote, photoUrl }) {
  const { rows } = await pool.query(
    `INSERT INTO logs (user_id, spot_id, visited_at, rating, quick_note, photo_url)
     VALUES ($1, $2, COALESCE($3, now()), $4, $5, $6)
     RETURNING *`,
    [userId, spotId, visitedAt || null, rating, quickNote || null, photoUrl || null]
  );
  return rows[0];
}

async function findAll({ userId, spotId, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const values = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (spotId) {
    values.push(spotId);
    conditions.push(`spot_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT * FROM logs ${whereClause} ORDER BY visited_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);
  return rows[0];
}

async function update(id, { rating, quickNote, photoUrl, visitedAt }) {
  const { rows } = await pool.query(
    `UPDATE logs
     SET rating = COALESCE($2, rating),
         quick_note = COALESCE($3, quick_note),
         photo_url = COALESCE($4, photo_url),
         visited_at = COALESCE($5, visited_at)
     WHERE id = $1
     RETURNING *`,
    [id, rating, quickNote, photoUrl, visitedAt]
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM logs WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { create, findAll, findById, update, remove };
