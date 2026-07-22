const request = require('supertest');
const app = require('../src/app');
const { resetDb, closeDb } = require('./db');
const { agentAs } = require('./helpers');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

// Order matters in this file: the rate-limit test intentionally exhausts
// the limiter (10 attempts/15min/IP, shared across signup+login), so it
// runs last. Each test file gets its own fresh module registry in Jest, so
// the limiter's in-memory counter starts clean for this file regardless of
// what other test files do.

function getCookie(res, name) {
  const cookies = res.headers['set-cookie'] || [];
  return cookies.find((c) => c.startsWith(`${name}=`));
}

describe('signup/login happy path', () => {
  test('signup sets an httpOnly cookie and returns the user, no token in body', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Auth Test', email: 'authtest@example.com', password: 'validpassword123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user.email).toBe('authtest@example.com');
    expect(res.body.user.password_hash).toBeUndefined();

    const cookie = getCookie(res, 'token');
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
  });

  test('login with correct credentials sets the cookie, no token in body', async () => {
    await request(app)
      .post('/auth/signup')
      .send({ name: 'Auth Test', email: 'logintest@example.com', password: 'validpassword123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'logintest@example.com', password: 'validpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(getCookie(res, 'token')).toBeDefined();
  });

  test('GET /auth/me returns the logged-in user after login', async () => {
    const agent = request.agent(app);
    await agent
      .post('/auth/signup')
      .send({ name: 'Me Test', email: 'metest@example.com', password: 'validpassword123' });

    const res = await agent.get('/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('metest@example.com');
    expect(res.body.password_hash).toBeUndefined();
  });

  test('GET /auth/me returns 401 without a session', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  test('POST /auth/logout clears the cookie and GET /auth/me then 401s', async () => {
    const agent = request.agent(app);
    await agent
      .post('/auth/signup')
      .send({ name: 'Logout Test', email: 'logouttest@example.com', password: 'validpassword123' });

    const logoutRes = await agent.post('/auth/logout');
    expect(logoutRes.status).toBe(204);

    const meRes = await agent.get('/auth/me');
    expect(meRes.status).toBe(401);
  });
});

describe('bad credentials', () => {
  test('login with wrong password returns 401', async () => {
    await request(app)
      .post('/auth/signup')
      .send({ name: 'Auth Test', email: 'wrongpass@example.com', password: 'validpassword123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'totallywrongpassword' });

    expect(res.status).toBe(401);
  });

  test('login with unknown email returns 401 (not a 404 leaking which emails exist)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'doesnotexist@example.com', password: 'whatever123' });

    expect(res.status).toBe(401);
  });
});

describe('spots browsing is public', () => {
  test('GET /spots without a cookie returns 200 (anonymous browsing/search)', async () => {
    const res = await request(app).get('/spots');
    expect(res.status).toBe(200);
  });

  test('GET /spots with a valid session still succeeds', async () => {
    const agent = agentAs(app, { id: 1, email: 'test@grubbuds.dev' });
    const res = await agent.get('/spots');
    expect(res.status).toBe(200);
  });
});

describe('mutating routes still require a session', () => {
  test('POST /spots without a cookie returns 401', async () => {
    const res = await request(app).post('/spots').send({ name: 'Anonymous Spot' });
    expect(res.status).toBe(401);
  });

  test('POST /logs without a cookie returns 401', async () => {
    const res = await request(app).post('/logs').send({ spotId: 1, rating: 5 });
    expect(res.status).toBe(401);
  });
});

describe('rate limiting', () => {
  test('exceeding 10 auth attempts from one IP returns 429', async () => {
    let sawRateLimited = false;

    for (let i = 0; i < 12; i++) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'ratelimit@example.com', password: 'whatever123' });

      if (res.status === 429) {
        sawRateLimited = true;
        break;
      }
    }

    expect(sawRateLimited).toBe(true);
  });
});
