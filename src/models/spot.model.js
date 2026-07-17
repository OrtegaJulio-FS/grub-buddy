const pool = require('../config/db');

async function create({ name, category, address, lat, lng, coverPhotoUrl, createdBy, city }) {
  const { rows } = await pool.query(
    `INSERT INTO spots (name, category, address, lat, lng, cover_photo_url, created_by, city)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'Des Moines'))
     RETURNING *`,
    [name, category || null, address || null, lat || null, lng || null, coverPhotoUrl || null, createdBy || null, city || null]
  );
  return rows[0];
}

// average_rating/log_count are computed here (LEFT JOIN + GROUP BY) rather
// than by the frontend fetching every log and aggregating client-side -
// cheaper at scale and the single source of truth for "what's this spot
// rated". AVG/COUNT are cast to float/int because node-pg otherwise returns
// numeric/bigint as strings.
async function findAll({ city, category } = {}) {
  const conditions = [];
  const values = [];

  if (city) {
    values.push(city);
    conditions.push(`spots.city = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`spots.category = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT
       spots.*,
       AVG(logs.rating)::float AS average_rating,
       COUNT(logs.id)::int AS log_count
     FROM spots
     LEFT JOIN logs ON logs.spot_id = spots.id
     ${whereClause}
     GROUP BY spots.id
     ORDER BY spots.created_at DESC`,
    values
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       spots.*,
       AVG(logs.rating)::float AS average_rating,
       COUNT(logs.id)::int AS log_count
     FROM spots
     LEFT JOIN logs ON logs.spot_id = spots.id
     WHERE spots.id = $1
     GROUP BY spots.id`,
    [id]
  );
  return rows[0];
}

async function update(id, { name, category, address, lat, lng, coverPhotoUrl, city }) {
  const { rows } = await pool.query(
    `UPDATE spots
     SET name = COALESCE($2, name),
         category = COALESCE($3, category),
         address = COALESCE($4, address),
         lat = COALESCE($5, lat),
         lng = COALESCE($6, lng),
         cover_photo_url = COALESCE($7, cover_photo_url),
         city = COALESCE($8, city),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, name, category, address, lat, lng, coverPhotoUrl, city]
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM spots WHERE id = $1', [id]);
  return rowCount > 0;
}

// "Taste overlap" - spots both users have independently logged. Not wired
// into any UI yet, just the query for a future profile-page feature.
async function findOverlap(userId, otherUserId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT spots.*
     FROM spots
     WHERE spots.id IN (SELECT spot_id FROM logs WHERE user_id = $1)
       AND spots.id IN (SELECT spot_id FROM logs WHERE user_id = $2)
     ORDER BY spots.name`,
    [userId, otherUserId]
  );
  return rows;
}

module.exports = { create, findAll, findById, update, remove, findOverlap };
