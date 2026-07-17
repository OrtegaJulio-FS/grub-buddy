// Minimal "migration" runner: applies db/schema.sql in full.
// No migration framework/history table yet - fine for early development where
// the schema is still shifting. Once the schema stabilizes, consider moving to
// node-pg-migrate or similar for versioned, incremental migrations.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying schema.sql...');
  await pool.query(sql);
  console.log('Schema applied successfully.');

  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
