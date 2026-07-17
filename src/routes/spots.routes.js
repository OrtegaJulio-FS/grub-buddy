const express = require('express');
const spotsController = require('../controllers/spots.controller');
const reviewsController = require('../controllers/reviews.controller');

const router = express.Router();

router.get('/', spotsController.list);
router.get('/:id', spotsController.getOne);
router.post('/', spotsController.create);
router.put('/:id', spotsController.update);
router.delete('/:id', spotsController.remove);

// Nested under spots since reviews are always viewed in the context of one
// spot; writing/editing a review still goes through /reviews (see reviews.routes.js).
router.get('/:id/reviews', reviewsController.listBySpot);

module.exports = router;
