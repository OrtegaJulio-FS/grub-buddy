// Runs once before the whole test suite: makes sure the test database
// exists and is fully migrated, so individual test files never have to
// worry about schema state - only data.
require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
const path = require('path');
const { runner } = require('node-pg-migrate');

module.exports = async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;
  const dbName = new URL(databaseUrl).pathname.slice(1);

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rows.length === 0) {
      // CREATE DATABASE can't be parameterized or run IF NOT EXISTS in
      // vanilla Postgres - dbName comes from our own .env.test, not user input.
      await admin.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await admin.end();
  }

  await runner({
    databaseUrl,
    dir: path.join(__dirname, '..', 'migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });
};
