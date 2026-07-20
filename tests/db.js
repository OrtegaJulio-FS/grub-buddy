const pool = require('../src/config/db');

// Matches src/middleware/fakeUser.js's hardcoded id - every request in
// these tests is attributed to this user, same as the real app today.
const FAKE_USER_ID = 1;
// A second real user, for ownership tests (owns a resource, req still acts
// as FAKE_USER_ID - so requests against this user's resources should 403).
const OTHER_USER_ID = 2;

// Full reset before each test: truncate every app table and reseed the two
// baseline users, so tests are isolated and don't depend on execution order.
async function resetDb() {
  await pool.query(
    'TRUNCATE list_items, lists, follows, reviews, logs, spots, users RESTART IDENTITY CASCADE'
  );

  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, city)
     VALUES
       ($1, 'Test User', 'test@grubbuds.dev', 'not-a-real-hash', 'Des Moines'),
       ($2, 'Other User', 'other@grubbuds.dev', 'not-a-real-hash', 'Des Moines')`,
    [FAKE_USER_ID, OTHER_USER_ID]
  );
  await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
}

async function closeDb() {
  await pool.end();
}

module.exports = { pool, resetDb, closeDb, FAKE_USER_ID, OTHER_USER_ID };
