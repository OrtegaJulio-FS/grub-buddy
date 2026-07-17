const pool = require('../config/db');

const PUBLIC_COLUMNS = 'id, name, email, bio, avatar_url, city, created_at, updated_at';

async function create({ name, email, passwordHash, bio, avatarUrl, city }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, bio, avatar_url, city)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Des Moines'))
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, passwordHash, bio || null, avatarUrl || null, city || null]
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function update(id, { name, bio, avatarUrl, city }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         bio = COALESCE($3, bio),
         avatar_url = COALESCE($4, avatar_url),
         city = COALESCE($5, city),
         updated_at = now()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, name, bio, avatarUrl, city]
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { create, findAll, findById, findByEmail, update, remove };
