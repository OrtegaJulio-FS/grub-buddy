const express = require('express');
const spotsController = require('../controllers/spots.controller');
const reviewsController = require('../controllers/reviews.controller');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Public (mounted with optionalAuth in app.js) - browsing/searching spots
// and reading their reviews doesn't require a session.
router.get('/', spotsController.list);
// Must come before /:id or Express would match "trending" as the :id param.
router.get('/trending', spotsController.trending);
router.get('/:id', spotsController.getOne);
router.get('/:id/reviews', reviewsController.listBySpot);

// Mutating - requireAuth on top of the router's optionalAuth, since
// creating/editing a spot needs a real logged-in owner.
router.post('/', requireAuth, spotsController.create);
router.put('/:id', requireAuth, spotsController.update);
router.delete('/:id', requireAuth, spotsController.remove);

module.exports = router;
