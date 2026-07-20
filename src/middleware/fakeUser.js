// Temporary stand-in for auth so the core loop (log a visit, rate a spot, browse)
// can be exercised before real auth is wired in. Attaches a hardcoded user to every
// request. Swap this out for `middleware/auth.js` (JWT-based) once ready -
// controllers only ever read `req.user`, so swapping which middleware
// populates it is a one-line change per route file in app.js.
//
// That swap alone does NOT make the app secure by itself: it only changes
// who req.user is, not who's allowed to act on what. Authorization (does
// req.user.id actually own this log/review/list?) lives in the controllers
// themselves (see src/utils/ownership.js and its callers), and keeps working
// unchanged once this middleware is swapped out.
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
