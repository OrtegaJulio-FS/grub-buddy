const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const requireAuth = require('./middleware/auth');
const usersRoutes = require('./routes/users.routes');
const spotsRoutes = require('./routes/spots.routes');
const logsRoutes = require('./routes/logs.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const followsRoutes = require('./routes/follows.routes');
const activityRoutes = require('./routes/activity.routes');
const listsRoutes = require('./routes/lists.routes');
const uploadsRoutes = require('./routes/uploads.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// CORS_ORIGIN can be a single origin or a comma-separated list (e.g. a
// staging + production frontend URL). Must be an explicit origin (never "*")
// now that auth is a cookie - browsers reject wildcard origins on
// credentialed requests outright. A production deploy with no CORS_ORIGIN
// set fails closed (blocks all cross-origin requests) rather than silently
// allowing any site to call the API; local dev falls back to Vite's default
// port instead.
function resolveCorsOrigin() {
  if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    return origins.length === 1 ? origins[0] : origins;
  }
  return process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173';
}

// Pure JSON API - no HTML/scripts served here, so helmet's defaults (CSP,
// no-sniff, frameguard, etc) apply cleanly with no custom directives needed.
app.use(helmet());
app.use(cors({ origin: resolveCorsOrigin(), credentials: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Real JWT signup/login/logout/me.
app.use('/auth', authRoutes);

// Every route below requires a real logged-in user (middleware/auth.js's
// requireAuth populates req.user from the httpOnly cookie). Authorization
// (does req.user.id actually own this log/review/list?) is a separate
// concern that lives in the controllers themselves (src/utils/ownership.js
// and its callers), which already read req.user.id.
app.use('/users', requireAuth, usersRoutes);
app.use('/spots', requireAuth, spotsRoutes);
app.use('/logs', requireAuth, logsRoutes);
app.use('/reviews', requireAuth, reviewsRoutes);
app.use('/follows', requireAuth, followsRoutes);
app.use('/activity', requireAuth, activityRoutes);
app.use('/lists', requireAuth, listsRoutes);
app.use('/uploads', requireAuth, uploadsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
