const app = require('../src/app');
const { resetDb, closeDb, FAKE_USER_ID } = require('./db');
const { agentAs } = require('./helpers');

let agent;

beforeEach(async () => {
  await resetDb();
  agent = agentAs(app, { id: FAKE_USER_ID, email: 'test@grubbuds.dev' });
});

afterAll(async () => {
  await closeDb();
});

describe('core loop: create spot -> create log -> server-side aggregate correctness', () => {
  test('average_rating/log_count start null/0 and update as logs are added', async () => {
    const spotRes = await agent
      .post('/spots')
      .send({ name: 'Test Cafe', category: 'cafe', city: 'Des Moines' });
    expect(spotRes.status).toBe(201);
    const spotId = spotRes.body.id;

    const before = await agent.get(`/spots/${spotId}`);
    expect(before.body.average_rating).toBeNull();
    expect(before.body.log_count).toBe(0);

    await agent.post('/logs').send({ spotId, rating: 5 }).expect(201);
    await agent.post('/logs').send({ spotId, rating: 3 }).expect(201);

    const after = await agent.get(`/spots/${spotId}`);
    expect(after.body.log_count).toBe(2);
    expect(after.body.average_rating).toBeCloseTo(4, 5);
  });

  test('GET /spots list view carries the same aggregate as GET /spots/:id', async () => {
    const spotRes = await agent.post('/spots').send({ name: 'List Cafe' });
    const spotId = spotRes.body.id;
    await agent.post('/logs').send({ spotId, rating: 4 }).expect(201);

    const listRes = await agent.get('/spots');
    const found = listRes.body.find((s) => s.id === spotId);
    expect(found).toBeDefined();
    expect(found.average_rating).toBe(4);
    expect(found.log_count).toBe(1);
  });

  test('a third log correctly shifts the average', async () => {
    const spotRes = await agent.post('/spots').send({ name: 'Three Log Cafe' });
    const spotId = spotRes.body.id;

    await agent.post('/logs').send({ spotId, rating: 5 }).expect(201);
    await agent.post('/logs').send({ spotId, rating: 5 }).expect(201);
    await agent.post('/logs').send({ spotId, rating: 2 }).expect(201);

    const res = await agent.get(`/spots/${spotId}`);
    expect(res.body.log_count).toBe(3);
    expect(res.body.average_rating).toBeCloseTo(4, 5); // (5+5+2)/3
  });
});
