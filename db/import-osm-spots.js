// One-time import of real restaurant/cafe/bar/bakery data for the Des
// Moines metro area from OpenStreetMap (via the Overpass API - free, no API
// key, ODbL-licensed). Safe to rerun: every insert is preceded by a
// name+coordinates dedup check, so a second run finds nothing new to add
// rather than creating duplicates. Purely additive - never touches the
// existing demo spots or the logs/reviews Priya/Marcus/Dana have on them.
//
// Usage: node db/import-osm-spots.js
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const userModel = require('../src/models/user.model');
const spotModel = require('../src/models/spot.model');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Des Moines metro bounding box (south, west, north, east) - validated
// against a real Overpass query before committing to it: ~514 named results
// with good suburb coverage (Clive, Urbandale, West Des Moines, Windsor
// Heights, Norwalk), not just downtown. Widen/narrow here if a future rerun
// needs different coverage.
const BBOX = { south: 41.5, west: -93.75, north: 41.65, east: -93.55 };

const SYSTEM_USER_EMAIL = 'osm-import@grubbuds.dev';
const SYSTEM_USER_NAME = 'OpenStreetMap Import';

// Matches src/components/layout/FilterPills.jsx's PILLS keys (lowercase,
// unaccented) - GET /spots?category= does an exact string match, so
// anything else here would silently break filtering for every imported spot.
function mapCategory(tags) {
  if (tags.amenity === 'restaurant') return 'restaurant';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'bar') return 'bar';
  if (tags.amenity === 'fast_food') return 'restaurant';
  if (tags.shop === 'bakery') return 'bakery';
  return null;
}

function resolveAddress(tags, lat, lng) {
  const housenumber = tags['addr:housenumber'];
  const street = tags['addr:street'];
  if (housenumber && street) return `${housenumber} ${street}`;
  if (street) return street;
  return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function resolveCity(tags) {
  return tags['addr:city'] || 'Des Moines';
}

function buildQuery({ south, west, north, east }) {
  const box = `(${south},${west},${north},${east})`;
  const clauses = [
    ['amenity', 'restaurant'],
    ['amenity', 'cafe'],
    ['amenity', 'bar'],
    ['amenity', 'fast_food'],
    ['shop', 'bakery'],
  ]
    .flatMap(([key, value]) => [`node["${key}"="${value}"]${box};`, `way["${key}"="${value}"]${box};`])
    .join('\n  ');

  return `[out:json][timeout:60];\n(\n  ${clauses}\n);\nout center tags;`;
}

async function fetchOverpassElements() {
  const query = buildQuery(BBOX);
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      'User-Agent': 'grubbuds-osm-import/1.0 (one-time data import script)',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    throw new Error(`Overpass API request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.elements;
}

// Gets or creates a system user distinct from the demo users
// (Test User/Priya/Marcus/Dana) to own every imported spot, so it's clear in
// the data which spots are real OSM imports vs hand-seeded demo data. Its
// password is a random, never-recorded string - nobody is meant to log in
// as this account.
async function getOrCreateSystemUser() {
  const existing = await userModel.findByEmail(SYSTEM_USER_EMAIL);
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  return userModel.create({
    name: SYSTEM_USER_NAME,
    email: SYSTEM_USER_EMAIL,
    passwordHash,
    bio: 'Automated account that owns spots imported from OpenStreetMap (data © OpenStreetMap contributors, ODbL).',
    city: 'Des Moines',
  });
}

// Same spot (by name, case-insensitively, within ~30m) already in the
// table - covers both a rerun of this script and any accidental overlap
// with the hand-seeded demo spots.
async function findExistingSpot(name, lat, lng) {
  const TOLERANCE = 0.0003;
  const { rows } = await pool.query(
    `SELECT id FROM spots
     WHERE name ILIKE $1 AND ABS(lat - $2) < $4 AND ABS(lng - $3) < $4
     LIMIT 1`,
    [name, lat, lng, TOLERANCE]
  );
  return rows[0];
}

async function importSpots() {
  console.log('Querying Overpass API for the Des Moines metro area...');
  const elements = await fetchOverpassElements();
  console.log(`Overpass returned ${elements.length} elements.`);

  const systemUser = await getOrCreateSystemUser();
  console.log(`Importing as system user "${systemUser.name}" (id=${systemUser.id}).`);

  const counts = { noName: 0, noCoords: 0, unmappedCategory: 0, duplicate: 0, inserted: 0 };
  const inserted = [];

  for (const element of elements) {
    const tags = element.tags || {};
    const name = tags.name;
    if (!name) {
      counts.noName += 1;
      continue;
    }

    const lat = element.type === 'node' ? element.lat : element.center?.lat;
    const lng = element.type === 'node' ? element.lon : element.center?.lon;
    if (lat === undefined || lng === undefined) {
      counts.noCoords += 1;
      continue;
    }

    const category = mapCategory(tags);
    if (!category) {
      counts.unmappedCategory += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const existing = await findExistingSpot(name, lat, lng);
    if (existing) {
      counts.duplicate += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const spot = await spotModel.create({
      name,
      category,
      address: resolveAddress(tags, lat, lng),
      lat,
      lng,
      coverPhotoUrl: null,
      createdBy: systemUser.id,
      city: resolveCity(tags),
    });
    counts.inserted += 1;
    inserted.push(spot);
  }

  console.log('\nImport summary:');
  console.log(`  Found from Overpass:     ${elements.length}`);
  console.log(`  Skipped (no name):       ${counts.noName}`);
  console.log(`  Skipped (no coords):     ${counts.noCoords}`);
  console.log(`  Skipped (unmapped tag):  ${counts.unmappedCategory}`);
  console.log(`  Skipped (duplicate):     ${counts.duplicate}`);
  console.log(`  Inserted:                ${counts.inserted}`);

  if (inserted.length > 0) {
    console.log('\nSample of inserted spots:');
    for (const spot of inserted.slice(0, 10)) {
      console.log(`  - ${spot.name} (${spot.category}) - ${spot.city}`);
    }
  }
}

importSpots()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
