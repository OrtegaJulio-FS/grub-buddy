const pool = require('../config/db');
const followModel = require('./follow.model');

// Merges logs and reviews from everyone `userId` follows into a single
// reverse-chronological feed. A UNION ALL keeps this as one query/one sort
// instead of fetching both lists and merging them in JS.
async function getActivityForUser(userId, limit = 50) {
  const followedIds = await followModel.findFollowedIds(userId);
  if (followedIds.length === 0) return [];

  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT
         'log' AS type,
         logs.id,
         logs.user_id,
         users.name AS user_name,
         logs.spot_id,
         spots.name AS spot_name,
         spots.cover_photo_url AS spot_cover_photo_url,
         logs.rating,
         logs.quick_note AS body,
         NULL::text[] AS tags,
         logs.visited_at AS activity_at
       FROM logs
       JOIN users ON users.id = logs.user_id
       JOIN spots ON spots.id = logs.spot_id
       WHERE logs.user_id = ANY($1::bigint[])

       UNION ALL

       SELECT
         'review' AS type,
         reviews.id,
         logs.user_id,
         users.name AS user_name,
         logs.spot_id,
         spots.name AS spot_name,
         spots.cover_photo_url AS spot_cover_photo_url,
         reviews.rating,
         reviews.body,
         reviews.tags,
         reviews.created_at AS activity_at
       FROM reviews
       JOIN logs ON logs.id = reviews.log_id
       JOIN users ON users.id = logs.user_id
       JOIN spots ON spots.id = logs.spot_id
       WHERE logs.user_id = ANY($1::bigint[])
     ) activity
     ORDER BY activity_at DESC
     LIMIT $2`,
    [followedIds, limit]
  );
  return rows;
}

module.exports = { getActivityForUser };
