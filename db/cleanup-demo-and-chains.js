// One-time cleanup: strips every demo/test account and its data out of the
// database, leaving only real spots imported from OpenStreetMap
// (db/import-osm-spots.js) and their legitimate owner (the "OpenStreetMap
// Import" system user). Also removes national/international franchise spots
// that Overpass's brand-tag filter missed the first time around.
//
// Usage:
//   node db/cleanup-demo-and-chains.js            # report only, no changes committed
//   node db/cleanup-demo-and-chains.js --apply    # actually deletes, in one transaction
//
// Always run without --apply first and read the "franchises flagged for
// removal" section before rerunning with --apply - a repeated name is
// deleted wholesale only if it matches the curated chain list below; a
// repeated name that *doesn't* match (e.g. "Tasty Tacos", a real Des Moines
// mini-chain) is left alone.
require('dotenv').config();
const pool = require('../src/config/db');

const APPLY = process.argv.includes('--apply');

const OSM_IMPORT_USER_ID = 8;

// Every account to remove: the 4 originally-seeded demo users (Test User,
// Priya, Marcus, Dana) plus 2 throwaway signups created during manual/
// automated testing of the auth flow (ids 5, 6 - "Browser Test" /
// "Browser Test 2", fake @example.com addresses, zero logs/reviews/follows/
// lists). Deliberately does NOT include id 7 (a real account signed up
// through the actual UI) or id 8 (the OSM import system user) - both stay.
const DEMO_USER_IDS = [1, 2, 3, 4, 5, 6];

// Well-known national/international restaurant/cafe/bar/bakery/fast-food
// chains - cross-referenced against duplicate-named OSM spots to catch
// franchises Overpass's brand-tag filter missed. Deliberately excludes
// smaller regional-only chains (e.g. Tasty Tacos, Happy Joe's, Biggby
// Coffee) - those are left for a human to judge via the "kept" list below
// rather than guessed at here.
const KNOWN_CHAINS = [
  "McDonald's", 'Subway', 'Burger King', "Wendy's", 'Taco Bell', 'KFC',
  'Pizza Hut', "Domino's", "Papa John's", "Papa Murphy's", 'Little Caesars',
  "Dunkin'", 'Dunkin Donuts', 'Starbucks', 'Panera Bread', 'Panera',
  'Chipotle', 'Chipotle Mexican Grill', "Applebee's", 'IHOP', "Denny's",
  'Waffle House', 'Cracker Barrel', 'Olive Garden', 'Red Lobster',
  'Outback Steakhouse', 'Texas Roadhouse', 'TGI Fridays', "Chili's",
  'Buffalo Wild Wings', 'Hooters', 'Perkins', 'Village Inn', 'Bob Evans',
  'Caribou Coffee', 'Tim Hortons', 'Krispy Kreme', 'Baskin-Robbins',
  'Dairy Queen', 'Sonic Drive-In', "Hardee's", "Steak 'n Shake",
  'White Castle', 'Five Guys', 'Wingstop', "Raising Cane's", "Zaxby's",
  'Popeyes', 'Chick-fil-A', "Jimmy John's", "Jersey Mike's",
  'Firehouse Subs', 'Panda Express', 'Qdoba', "Freddy's",
  "Freddy's Frozen Custard & Steakburgers", "Culver's", "Arby's",
  "Long John Silver's", "Einstein Bros Bagels", 'Cinnabon', "Auntie Anne's",
  'Jamba Juice', 'Smoothie King', 'Jack in the Box', "Carl's Jr",
  'In-N-Out Burger', 'El Pollo Loco', 'Boston Market', 'Golden Corral',
  'Ruby Tuesday', "Godfather's Pizza", "Scooter's Coffee", "Bruegger's Bagels",
  'A&W', 'A&W Restaurant', "Fazoli's", 'Noodles & Company', 'Noodles and Company',
  "Taco John's",
];

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const NORMALIZED_CHAINS = KNOWN_CHAINS.map(normalize);

// Exact match ("Subway" === "Subway") or whole-word substring match in
// either direction ("Jersey Mike's Subs" contains chain "Jersey Mike's";
// conversely catches a chain list entry that's itself more specific than
// the OSM name) - padded with spaces so "kfc" can't match inside an
// unrelated word like "kfcorner".
function isChainMatch(name) {
  const candidate = ` ${normalize(name)} `;
  return NORMALIZED_CHAINS.some((chain) => {
    const padded = ` ${chain} `;
    return candidate === padded || candidate.includes(padded) || padded.includes(candidate);
  });
}

async function reportDemoCleanup(client) {
  const spots = await client.query(
    'SELECT id, name FROM spots WHERE created_by IS DISTINCT FROM $1',
    [OSM_IMPORT_USER_ID]
  );
  const spotIds = spots.rows.map((r) => r.id);

  console.log(`\nDemo spots to remove (owned by someone other than the OSM import user): ${spotIds.length}`);
  for (const s of spots.rows) console.log(`  - ${s.name} (id ${s.id})`);

  const usersRes = await client.query('SELECT id, name, email FROM users WHERE id = ANY($1)', [DEMO_USER_IDS]);
  console.log(`\nDemo/test users to remove: ${usersRes.rows.length}`);
  for (const u of usersRes.rows) console.log(`  - ${u.name} <${u.email}> (id ${u.id})`);

  return spotIds;
}

async function deleteDemoSpots(client, spotIds) {
  if (spotIds.length === 0) return { reviews: 0, listItems: 0, logs: 0, spots: 0 };

  const reviews = await client.query(
    'DELETE FROM reviews WHERE log_id IN (SELECT id FROM logs WHERE spot_id = ANY($1)) RETURNING id',
    [spotIds]
  );
  const listItems = await client.query('DELETE FROM list_items WHERE spot_id = ANY($1) RETURNING spot_id', [spotIds]);
  const logs = await client.query('DELETE FROM logs WHERE spot_id = ANY($1) RETURNING id', [spotIds]);
  const spots = await client.query('DELETE FROM spots WHERE id = ANY($1) RETURNING id', [spotIds]);

  return {
    reviews: reviews.rowCount,
    listItems: listItems.rowCount,
    logs: logs.rowCount,
    spots: spots.rowCount,
  };
}

async function deleteDemoUsers(client, userIds) {
  const follows = await client.query(
    'DELETE FROM follows WHERE follower_id = ANY($1) OR followed_id = ANY($1) RETURNING follower_id',
    [userIds]
  );
  const reviews = await client.query(
    'DELETE FROM reviews WHERE log_id IN (SELECT id FROM logs WHERE user_id = ANY($1)) RETURNING id',
    [userIds]
  );
  const listItems = await client.query(
    'DELETE FROM list_items WHERE list_id IN (SELECT id FROM lists WHERE user_id = ANY($1)) RETURNING spot_id',
    [userIds]
  );
  const logs = await client.query('DELETE FROM logs WHERE user_id = ANY($1) RETURNING id', [userIds]);
  const lists = await client.query('DELETE FROM lists WHERE user_id = ANY($1) RETURNING id', [userIds]);
  const users = await client.query('DELETE FROM users WHERE id = ANY($1) RETURNING id', [userIds]);

  return {
    follows: follows.rowCount,
    reviews: reviews.rowCount,
    listItems: listItems.rowCount,
    logs: logs.rowCount,
    lists: lists.rowCount,
    users: users.rowCount,
  };
}

async function findChainSpots(client) {
  const { rows } = await client.query(
    `SELECT name, COUNT(*)::int AS count, array_agg(id) AS ids
     FROM spots
     WHERE created_by = $1
     GROUP BY name
     HAVING COUNT(*) > 1
     ORDER BY count DESC, name`,
    [OSM_IMPORT_USER_ID]
  );

  const flagged = [];
  const kept = [];
  for (const row of rows) {
    if (isChainMatch(row.name)) {
      flagged.push(row);
    } else {
      kept.push(row);
    }
  }
  return { flagged, kept };
}

async function deleteChainSpots(client, flagged) {
  const allIds = flagged.flatMap((row) => row.ids);
  if (allIds.length === 0) return { reviews: 0, listItems: 0, logs: 0, spots: 0 };

  const reviews = await client.query(
    'DELETE FROM reviews WHERE log_id IN (SELECT id FROM logs WHERE spot_id = ANY($1)) RETURNING id',
    [allIds]
  );
  const listItems = await client.query('DELETE FROM list_items WHERE spot_id = ANY($1) RETURNING spot_id', [allIds]);
  const logs = await client.query('DELETE FROM logs WHERE spot_id = ANY($1) RETURNING id', [allIds]);
  const spots = await client.query('DELETE FROM spots WHERE id = ANY($1) RETURNING id', [allIds]);

  return {
    reviews: reviews.rowCount,
    listItems: listItems.rowCount,
    logs: logs.rowCount,
    spots: spots.rowCount,
  };
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`Mode: ${APPLY ? 'APPLY (will commit)' : 'REPORT ONLY (will roll back, no changes saved)'}`);

    console.log('\n=== Step 1+2: demo spots and demo/test users ===');
    const demoSpotIds = await reportDemoCleanup(client);
    const spotDeletion = await deleteDemoSpots(client, demoSpotIds);
    const userDeletion = await deleteDemoUsers(client, DEMO_USER_IDS);

    console.log('\n=== Step 3: franchise spots the brand-tag filter missed ===');
    const { flagged, kept } = await findChainSpots(client);

    console.log(`\nDuplicate-named spots flagged for removal (matched known chain list): ${flagged.length} names`);
    for (const row of flagged) console.log(`  - ${row.name} x${row.count}`);

    console.log(`\nDuplicate-named spots KEPT (not in known chain list - likely legitimate local mini-chains): ${kept.length} names`);
    for (const row of kept) console.log(`  - ${row.name} x${row.count}`);

    const chainDeletion = await deleteChainSpots(client, flagged);

    const totals = {
      spotsDeleted: spotDeletion.spots + chainDeletion.spots,
      usersDeleted: userDeletion.users,
      logsDeleted: spotDeletion.logs + userDeletion.logs + chainDeletion.logs,
      reviewsDeleted: spotDeletion.reviews + userDeletion.reviews + chainDeletion.reviews,
      followsDeleted: userDeletion.follows,
      listsDeleted: userDeletion.lists,
      listItemsDeleted: spotDeletion.listItems + userDeletion.listItems + chainDeletion.listItems,
    };

    const remaining = await client.query('SELECT COUNT(*)::int AS count FROM spots');
    const remainingByOsm = await client.query(
      'SELECT COUNT(*)::int AS count FROM spots WHERE created_by = $1',
      [OSM_IMPORT_USER_ID]
    );
    const osmUserCheck = await client.query('SELECT id, name, email FROM users WHERE id = $1', [OSM_IMPORT_USER_ID]);

    console.log('\n=== Summary ===');
    console.log(`  Spots deleted:       ${totals.spotsDeleted}`);
    console.log(`  Users deleted:       ${totals.usersDeleted}`);
    console.log(`  Logs deleted:        ${totals.logsDeleted}`);
    console.log(`  Reviews deleted:     ${totals.reviewsDeleted}`);
    console.log(`  Follows deleted:     ${totals.followsDeleted}`);
    console.log(`  Lists deleted:       ${totals.listsDeleted}`);
    console.log(`  List items deleted:  ${totals.listItemsDeleted}`);
    console.log(`\n  Spots remaining (total):        ${remaining.rows[0].count}`);
    console.log(`  Spots remaining (OSM import):   ${remainingByOsm.rows[0].count}`);
    console.log(
      `\n  OpenStreetMap Import user intact: ${osmUserCheck.rows.length === 1 ? `yes (id ${osmUserCheck.rows[0].id}, ${osmUserCheck.rows[0].email})` : 'NO - MISSING, INVESTIGATE'}`
    );

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\nCOMMITTED - changes are permanent.');
    } else {
      await client.query('ROLLBACK');
      console.log('\nROLLED BACK - nothing was actually changed. Rerun with --apply to commit these changes.');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cleanup failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
