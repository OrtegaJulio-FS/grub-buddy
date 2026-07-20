const request = require('supertest');
const app = require('../src/app');
const reviewModel = require('../src/models/review.model');
const { pool, resetDb, closeDb, FAKE_USER_ID } = require('./db');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

async function seedSpot() {
  const { rows } = await pool.query(
    `INSERT INTO spots (name, city, created_by) VALUES ('Transactional Test Spot', 'Des Moines', $1) RETURNING id`,
    [FAKE_USER_ID]
  );
  return rows[0].id;
}

describe('POST /reviews with spotId (no existing log)', () => {
  test('creates both the log and the review, and updates the spot aggregate', async () => {
    const spotId = await seedSpot();

    const res = await request(app)
      .post('/reviews')
      .send({ spotId, rating: 5, body: 'Transactional review test', tags: ['Cozy'] });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.log_id).toBeDefined();

    const { rows } = await pool.query('SELECT COUNT(*) FROM logs WHERE spot_id = $1', [spotId]);
    expect(Number(rows[0].count)).toBe(1);

    const spotRes = await request(app).get(`/spots/${spotId}`);
    expect(spotRes.body.log_count).toBe(1);
    expect(spotRes.body.average_rating).toBe(5);
  });

  test('rejects a missing rating with 400, not a 500', async () => {
    const spotId = await seedSpot();
    const res = await request(app).post('/reviews').send({ spotId, body: 'no rating given' });
    expect(res.status).toBe(400);
  });
});

describe('reviewModel.createWithLog rollback', () => {
  test('a failed review insert rolls back the log insert too - no orphan log', async () => {
    const spotId = await seedSpot();

    const before = await pool.query('SELECT COUNT(*) FROM logs WHERE spot_id = $1', [spotId]);
    expect(Number(before.rows[0].count)).toBe(0);

    // body: null bypasses controller validation entirely and hits
    // reviews.body's NOT NULL constraint mid-transaction, after the log
    // insert has already run within the same BEGIN/COMMIT.
    await expect(
      reviewModel.createWithLog({
        userId: FAKE_USER_ID,
        spotId,
        visitedAt: null,
        rating: 5,
        quickNote: null,
        body: null,
        tags: null,
      })
    ).rejects.toThrow();

    const after = await pool.query('SELECT COUNT(*) FROM logs WHERE spot_id = $1', [spotId]);
    expect(Number(after.rows[0].count)).toBe(0);
  });
});
