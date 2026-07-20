// Runs before each test file's module registry loads, so DATABASE_URL etc.
// are set before src/config/db.js (or anything else reading process.env) is
// first required.
require('dotenv').config({ path: '.env.test' });
