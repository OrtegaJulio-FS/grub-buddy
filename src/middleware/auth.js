// Real JWT auth middleware. Reads the token from the httpOnly cookie set by
// /auth/signup and /auth/login (src/utils/cookies.js) rather than an
// Authorization header, since the frontend never has JS-level access to the
// token. req.user carries { id, email } from the token payload.
const { verifyToken } = require('../utils/jwt');
const { COOKIE_NAME } = require('../utils/cookies');

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
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
