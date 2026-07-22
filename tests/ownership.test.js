const app = require('../src/app');
const { pool, resetDb, closeDb, FAKE_USER_ID, OTHER_USER_ID } = require('./db');
const { agentAs } = require('./helpers');

let agent;

beforeEach(async () => {
  await resetDb();
  agent = agentAs(app, { id: FAKE_USER_ID, email: 'test@grubbuds.dev' });
});

afterAll(async () => {
  await closeDb();
});

// Every request in these tests is authenticated as FAKE_USER_ID (via
// tests/helpers.js's agentAs) - resources are seeded directly in the DB as
// belonging to either FAKE_USER_ID (owner - should succeed) or
// OTHER_USER_ID (non-owner - should 403), mirroring how ownership was
// manually verified against seed data before this suite existed.

async function seedSpot() {
  const { rows } = await pool.query(
    `INSERT INTO spots (name, city, created_by) VALUES ('Ownership Test Spot', 'Des Moines', $1) RETURNING id`,
    [FAKE_USER_ID]
  );
  return rows[0].id;
}

async function seedLog(userId, spotId, rating = 4) {
  const { rows } = await pool.query(
    `INSERT INTO logs (user_id, spot_id, rating) VALUES ($1, $2, $3) RETURNING id`,
    [userId, spotId, rating]
  );
  return rows[0].id;
}

async function seedReview(logId, rating = 4) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (log_id, body, rating) VALUES ($1, 'seed review', $2) RETURNING id`,
    [logId, rating]
  );
  return rows[0].id;
}

async function seedList(userId) {
  const { rows } = await pool.query(
    `INSERT INTO lists (user_id, title) VALUES ($1, 'Ownership Test List') RETURNING id`,
    [userId]
  );
  return rows[0].id;
}

describe('log ownership (PUT/DELETE /logs/:id)', () => {
  test('owner can update their own log', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(FAKE_USER_ID, spotId);

    const res = await agent.put(`/logs/${logId}`).send({ rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(5);
  });

  test('non-owner gets 403 updating a log', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(OTHER_USER_ID, spotId);

    const res = await agent.put(`/logs/${logId}`).send({ rating: 5 });
    expect(res.status).toBe(403);
  });

  test('owner can delete their own log', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(FAKE_USER_ID, spotId);

    const res = await agent.delete(`/logs/${logId}`);
    expect(res.status).toBe(204);
  });

  test('non-owner gets 403 deleting a log', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(OTHER_USER_ID, spotId);

    const res = await agent.delete(`/logs/${logId}`);
    expect(res.status).toBe(403);
  });
});

describe('review ownership (PATCH /reviews/:id, POST /reviews)', () => {
  test('owner can update their own review', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(FAKE_USER_ID, spotId);
    const reviewId = await seedReview(logId);

    const res = await agent.patch(`/reviews/${reviewId}`).send({ body: 'edited' });
    expect(res.status).toBe(200);
    expect(res.body.body).toBe('edited');
  });

  test('non-owner gets 403 updating a review', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(OTHER_USER_ID, spotId);
    const reviewId = await seedReview(logId);

    const res = await agent.patch(`/reviews/${reviewId}`).send({ body: 'edited' });
    expect(res.status).toBe(403);
  });

  test('POST /reviews with someone else\'s logId is rejected with 403', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(OTHER_USER_ID, spotId);

    const res = await agent
      .post('/reviews')
      .send({ logId, body: 'trying to review someone else\'s log', rating: 5 });
    expect(res.status).toBe(403);
  });

  test('POST /reviews with your own logId succeeds', async () => {
    const spotId = await seedSpot();
    const logId = await seedLog(FAKE_USER_ID, spotId);

    const res = await agent.post('/reviews').send({ logId, body: 'my own review', rating: 5 });
    expect(res.status).toBe(201);
  });
});

describe('list ownership (PATCH/DELETE /lists/:id, items add/remove)', () => {
  test('owner can update their own list', async () => {
    const listId = await seedList(FAKE_USER_ID);
    const res = await agent.patch(`/lists/${listId}`).send({ title: 'Renamed' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed');
  });

  test('non-owner gets 403 updating a list', async () => {
    const listId = await seedList(OTHER_USER_ID);
    const res = await agent.patch(`/lists/${listId}`).send({ title: 'Renamed' });
    expect(res.status).toBe(403);
  });

  test('owner can delete their own list', async () => {
    const listId = await seedList(FAKE_USER_ID);
    const res = await agent.delete(`/lists/${listId}`);
    expect(res.status).toBe(204);
  });

  test('non-owner gets 403 deleting a list', async () => {
    const listId = await seedList(OTHER_USER_ID);
    const res = await agent.delete(`/lists/${listId}`);
    expect(res.status).toBe(403);
  });

  test('owner can add a spot to their own list', async () => {
    const listId = await seedList(FAKE_USER_ID);
    const spotId = await seedSpot();
    const res = await agent.post(`/lists/${listId}/items`).send({ spotId });
    expect(res.status).toBe(201);
  });

  test('non-owner gets 403 adding a spot to a list', async () => {
    const listId = await seedList(OTHER_USER_ID);
    const spotId = await seedSpot();
    const res = await agent.post(`/lists/${listId}/items`).send({ spotId });
    expect(res.status).toBe(403);
  });

  test('non-owner gets 403 removing a spot from a list', async () => {
    const listId = await seedList(OTHER_USER_ID);
    const spotId = await seedSpot();
    await pool.query('INSERT INTO list_items (list_id, spot_id) VALUES ($1, $2)', [listId, spotId]);

    const res = await agent.delete(`/lists/${listId}/items/${spotId}`);
    expect(res.status).toBe(403);
  });
});

describe('user profile ownership (PUT/DELETE /users/:id, self only)', () => {
  test('self can update own profile', async () => {
    const res = await agent.put(`/users/${FAKE_USER_ID}`).send({ bio: 'updated bio' });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('updated bio');
  });

  test('cannot update someone else\'s profile', async () => {
    const res = await agent.put(`/users/${OTHER_USER_ID}`).send({ bio: 'hacked' });
    expect(res.status).toBe(403);
  });

  test('cannot delete someone else\'s account', async () => {
    const res = await agent.delete(`/users/${OTHER_USER_ID}`);
    expect(res.status).toBe(403);
  });
});
