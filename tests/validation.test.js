const request = require('supertest');
const app = require('../src/app');
const { pool, resetDb, closeDb, FAKE_USER_ID } = require('./db');
const { agentAs } = require('./helpers');

let agent;

beforeEach(async () => {
  await resetDb();
  agent = agentAs(app, { id: FAKE_USER_ID, email: 'test@grubbuds.dev' });
});

afterAll(async () => {
  await closeDb();
});

async function seedSpot() {
  const { rows } = await pool.query(
    `INSERT INTO spots (name, city, created_by) VALUES ('Validation Test Spot', 'Des Moines', $1) RETURNING id`,
    [FAKE_USER_ID]
  );
  return rows[0].id;
}

async function seedLog(rating = 4) {
  const spotId = await seedSpot();
  const { rows } = await pool.query(
    `INSERT INTO logs (user_id, spot_id, rating) VALUES ($1, $2, $3) RETURNING id`,
    [FAKE_USER_ID, spotId, rating]
  );
  return rows[0].id;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

describe('rating validation', () => {
  test('POST /logs rejects rating 0', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/logs').send({ spotId, rating: 0 });
    expect(res.status).toBe(400);
  });

  test('POST /logs rejects rating 6', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/logs').send({ spotId, rating: 6 });
    expect(res.status).toBe(400);
  });

  test('POST /logs rejects a non-integer rating', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/logs').send({ spotId, rating: 3.5 });
    expect(res.status).toBe(400);
  });

  test('POST /logs rejects a missing rating', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/logs').send({ spotId });
    expect(res.status).toBe(400);
  });
});

describe('numeric query param validation', () => {
  test('GET /spots/trending?limit=abc returns 400, not 500', async () => {
    const res = await agent.get('/spots/trending?limit=abc');
    expect(res.status).toBe(400);
  });

  test('GET /spots/trending?limit=-3 returns 400', async () => {
    const res = await agent.get('/spots/trending?limit=-3');
    expect(res.status).toBe(400);
  });

  test('GET /spots?minRating=abc returns 400, not 500', async () => {
    const res = await agent.get('/spots?minRating=abc');
    expect(res.status).toBe(400);
  });

  test('GET /spots?limit=abc returns 400', async () => {
    const res = await agent.get('/spots?limit=abc');
    expect(res.status).toBe(400);
  });

  test('GET /spots?offset=-1 returns 400', async () => {
    const res = await agent.get('/spots?offset=-1');
    expect(res.status).toBe(400);
  });

  test('GET /spots?limit=500 is accepted and clamped, not rejected', async () => {
    const res = await agent.get('/spots?limit=500');
    expect(res.status).toBe(200);
  });
});

describe('future visited_at rejection', () => {
  test('POST /logs rejects a future visitedAt', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/logs').send({ spotId, rating: 4, visitedAt: tomorrow() });
    expect(res.status).toBe(400);
  });

  test('PUT /logs/:id rejects a future visitedAt', async () => {
    const logId = await seedLog();
    const res = await agent.put(`/logs/${logId}`).send({ visitedAt: tomorrow() });
    expect(res.status).toBe(400);
  });

  test('POST /reviews (spotId path) rejects a future visitedAt', async () => {
    const spotId = await seedSpot();
    const res = await agent
      .post('/reviews')
      .send({ spotId, rating: 4, body: 'future dated', visitedAt: tomorrow() });
    expect(res.status).toBe(400);
  });

  test('POST /logs accepts today\'s date', async () => {
    const spotId = await seedSpot();
    const today = new Date().toISOString().slice(0, 10);
    const res = await agent.post('/logs').send({ spotId, rating: 4, visitedAt: today });
    expect(res.status).toBe(201);
  });
});

describe('signup validation', () => {
  test('rejects a malformed email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Test', email: 'not-an-email', password: 'validpassword123' });
    expect(res.status).toBe(400);
  });

  test('rejects a password under 8 characters', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Test', email: 'shortpass@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('review rating validation', () => {
  test('POST /reviews (spotId path) requires a rating', async () => {
    const spotId = await seedSpot();
    const res = await agent.post('/reviews').send({ spotId, body: 'no rating' });
    expect(res.status).toBe(400);
  });

  test('POST /reviews (logId path) requires a rating', async () => {
    const logId = await seedLog();
    const res = await agent.post('/reviews').send({ logId, body: 'no rating' });
    expect(res.status).toBe(400);
  });
});
