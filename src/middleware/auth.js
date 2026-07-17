// Real JWT auth middleware. Not wired into /spots, /logs, or /users yet -
// those currently run on middleware/fakeUser.js so the core loop can be tested
// without a login flow. Once ready, swap fakeUser for requireAuth in
// src/app.js (or per-router) and req.user will carry { id, email } from the token.
const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
