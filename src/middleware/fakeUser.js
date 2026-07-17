// Temporary stand-in for auth so the core loop (log a visit, rate a spot, browse)
// can be exercised before real auth is wired in. Attaches a hardcoded user to every
// request. Swap this out for `middleware/auth.js` (JWT-based) once ready -
// controllers only ever read `req.user`, so that swap should be a one-line change
// per route file.
const FAKE_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@grubbuds.dev',
  city: 'Des Moines',
};

function fakeUser(req, res, next) {
  req.user = FAKE_USER;
  next();
}

module.exports = fakeUser;
