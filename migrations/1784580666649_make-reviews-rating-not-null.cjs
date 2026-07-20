/**
 * Product decision: a review's rating is required - the frontend's
 * WriteReviewModal already enforces this (the fork picker is required
 * before "Post review" enables), so the column should too.
 *
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // Backfill any existing NULL ratings from the review's own log (every
  // review is attached to a log, and logs.rating is already required) before
  // adding the NOT NULL constraint, so this doesn't fail against a database
  // that happens to have old NULL-rating rows.
  pgm.sql(`
    UPDATE reviews
    SET rating = logs.rating
    FROM logs
    WHERE reviews.log_id = logs.id AND reviews.rating IS NULL;
  `);

  pgm.alterColumn('reviews', 'rating', { notNull: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.alterColumn('reviews', 'rating', { notNull: false });
};
