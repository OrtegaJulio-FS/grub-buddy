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

async function findAll({ city, category } = {}) {
  const conditions = [];
  const values = [];

  if (city) {
    values.push(city);
    conditions.push(`city = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM spots ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM spots WHERE id = $1', [id]);
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

module.exports = { create, findAll, findById, update, remove };
