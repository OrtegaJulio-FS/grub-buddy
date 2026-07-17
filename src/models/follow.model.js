const pool = require('../config/db');

async function create({ followerId, followedId }) {
  const { rows } = await pool.query(
    `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) RETURNING *`,
    [followerId, followedId]
  );
  return rows[0];
}

async function remove({ followerId, followedId }) {
  const { rowCount } = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
    [followerId, followedId]
  );
  return rowCount > 0;
}

async function isFollowing(followerId, followedId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2',
    [followerId, followedId]
  );
  return rows.length > 0;
}

// Users who follow `userId`.
async function findFollowers(userId) {
  const { rows } = await pool.query(
    `SELECT users.id, users.name, users.bio, users.avatar_url, users.city
     FROM follows
     JOIN users ON users.id = follows.follower_id
     WHERE follows.followed_id = $1
     ORDER BY follows.created_at DESC`,
    [userId]
  );
  return rows;
}

// Users that `userId` follows.
async function findFollowing(userId) {
  const { rows } = await pool.query(
    `SELECT users.id, users.name, users.bio, users.avatar_url, users.city
     FROM follows
     JOIN users ON users.id = follows.followed_id
     WHERE follows.follower_id = $1
     ORDER BY follows.created_at DESC`,
    [userId]
  );
  return rows;
}

// Just the ids `userId` follows - all the activity feed needs.
async function findFollowedIds(userId) {
  const { rows } = await pool.query('SELECT followed_id FROM follows WHERE follower_id = $1', [
    userId,
  ]);
  return rows.map((row) => row.followed_id);
}

module.exports = { create, remove, isFollowing, findFollowers, findFollowing, findFollowedIds };
