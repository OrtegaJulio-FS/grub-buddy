const pool = require('../config/db');

async function create({ userId, title, description, isPublic }) {
  const { rows } = await pool.query(
    `INSERT INTO lists (user_id, title, description, is_public)
     VALUES ($1, $2, $3, COALESCE($4, true))
     RETURNING *`,
    [userId, title, description || null, isPublic]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);
  return rows[0];
}

async function findByUserId(userId) {
  const { rows } = await pool.query('SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at DESC', [
    userId,
  ]);
  return rows;
}

async function update(id, { title, description, isPublic }) {
  const { rows } = await pool.query(
    `UPDATE lists
     SET title = COALESCE($2, title),
         description = COALESCE($3, description),
         is_public = COALESCE($4, is_public),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, title, description, isPublic]
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM lists WHERE id = $1', [id]);
  return rowCount > 0;
}

// Spots on a list, most-recently-added first.
async function findSpots(listId) {
  const { rows } = await pool.query(
    `SELECT spots.*, list_items.added_at
     FROM list_items
     JOIN spots ON spots.id = list_items.spot_id
     WHERE list_items.list_id = $1
     ORDER BY list_items.added_at DESC`,
    [listId]
  );
  return rows;
}

async function addItem(listId, spotId) {
  const { rows } = await pool.query(
    'INSERT INTO list_items (list_id, spot_id) VALUES ($1, $2) RETURNING *',
    [listId, spotId]
  );
  return rows[0];
}

async function removeItem(listId, spotId) {
  const { rowCount } = await pool.query(
    'DELETE FROM list_items WHERE list_id = $1 AND spot_id = $2',
    [listId, spotId]
  );
  return rowCount > 0;
}

module.exports = { create, findById, findByUserId, update, remove, findSpots, addItem, removeItem };
