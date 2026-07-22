// Like requireAuth, but never blocks the request - attaches req.user from
// the httpOnly cookie when a valid session exists, otherwise leaves it null
// and lets the request through. For routes that should be browsable by
// anyone but can still personalize the response for a logged-in visitor
// (though none of the current public routes do that yet - see
// src/routes/spots.routes.js).
const { verifyToken } = require('../utils/jwt');
const { COOKIE_NAME } = require('../utils/cookies');

function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    req.user = null;
  }
  next();
}

module.exports = optionalAuth;
