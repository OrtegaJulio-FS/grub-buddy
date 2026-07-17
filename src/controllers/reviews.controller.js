const reviewModel = require('../models/review.model');

async function listBySpot(req, res, next) {
  try {
    const reviews = await reviewModel.findBySpotId(req.params.id);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

async function create(req, res, next) {
  try {
    const { logId, body, rating, tags } = req.body;
    if (!logId || !body) {
      return res.status(400).json({ error: 'logId and body are required' });
    }
    if (rating !== undefined && rating !== null && !isValidRating(rating)) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }
    const review = await reviewModel.create({ logId, body, rating, tags });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A review already exists for this log - use PATCH to edit it' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Log not found' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { body, rating, tags } = req.body;
    if (rating !== undefined && rating !== null && !isValidRating(rating)) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }
    const review = await reviewModel.update(req.params.id, { body, rating, tags });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

module.exports = { listBySpot, create, update };
