require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function seed() {
  const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  console.log('Applying seed.sql...');
  await pool.query(sql);
  console.log('Seed applied successfully.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
