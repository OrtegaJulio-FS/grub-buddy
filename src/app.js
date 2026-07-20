const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const fakeUser = require('./middleware/fakeUser');
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

// Pure JSON API - no HTML/scripts served here, so helmet's defaults (CSP,
// no-sniff, frameguard, etc) apply cleanly with no custom directives needed.
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Real JWT signup/login. Kept independent of the fakeUser-gated routes below
// so the two can be developed and tested on separate tracks.
app.use('/auth', authRoutes);

// Core loop routes - no real auth yet, every request is treated as the same
// hardcoded user (see middleware/fakeUser.js). Swap `fakeUser` for
// `middleware/auth.js`'s requireAuth once you're ready to require real
// logins - that swap only changes who req.user is. It does not add
// authorization by itself; the ownership checks that decide who's allowed
// to edit/delete a given resource live in the controllers (src/utils/ownership.js)
// and already read req.user.id, so they keep working unchanged either way.
app.use('/users', fakeUser, usersRoutes);
app.use('/spots', fakeUser, spotsRoutes);
app.use('/logs', fakeUser, logsRoutes);
app.use('/reviews', fakeUser, reviewsRoutes);
app.use('/follows', fakeUser, followsRoutes);
app.use('/activity', fakeUser, activityRoutes);
app.use('/lists', fakeUser, listsRoutes);
app.use('/uploads', fakeUser, uploadsRoutes);

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
