const reviewModel = require('../models/review.model');
const logModel = require('../models/log.model');
const { isOwnedBy } = require('../utils/ownership');
const { isFutureDate, parsePagination } = require('../utils/validation');

async function listBySpot(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    if (pagination === null) {
      return res.status(400).json({ error: 'limit/offset must be positive integers' });
    }
    const reviews = await reviewModel.findBySpotId(req.params.id, pagination);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// Two ways to create a review:
//   - { logId, body, rating, tags } - attach to a visit already logged
//     (must belong to req.user.id).
//   - { spotId, visitedAt, quickNote, body, rating, tags } - no existing log
//     for this spot yet, so create the log and the review together in one
//     transaction (see reviewModel.createWithLog) rather than the frontend
//     doing two separate requests that could leave an orphan log behind.
async function create(req, res, next) {
  try {
    const { logId, spotId, visitedAt, quickNote, body, rating, tags } = req.body;

    if (!body) {
      return res.status(400).json({ error: 'body is required' });
    }

    if (logId) {
      // reviews.rating is NOT NULL at the DB level (a review's rating is
      // required, same as a log's) - require it here too rather than
      // letting an omitted rating reach the DB and surface as a raw
      // constraint-violation 500.
      if (!isValidRating(rating)) {
        return res.status(400).json({ error: 'rating is required and must be an integer between 1 and 5' });
      }

      const log = await logModel.findById(logId);
      if (!log) return res.status(404).json({ error: 'Log not found' });
      if (!isOwnedBy(log, req.user.id)) {
        return res.status(403).json({ error: 'You can only review your own logs' });
      }

      const review = await reviewModel.create({ logId, body, rating, tags });
      return res.status(201).json(review);
    }

    if (spotId) {
      if (!isValidRating(rating)) {
        return res.status(400).json({ error: 'rating is required and must be an integer between 1 and 5' });
      }
      if (visitedAt && isFutureDate(visitedAt)) {
        return res.status(400).json({ error: 'visitedAt cannot be in the future' });
      }

      const { review } = await reviewModel.createWithLog({
        userId: req.user.id,
        spotId,
        visitedAt,
        rating,
        quickNote,
        body,
        tags,
      });
      return res.status(201).json(review);
    }

    return res.status(400).json({ error: 'Either logId or spotId is required' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A review already exists for this log - use PATCH to edit it' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Log or spot not found' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await reviewModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Review not found' });

    const log = await logModel.findById(existing.log_id);
    if (!isOwnedBy(log, req.user.id)) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    const { body, rating, tags } = req.body;
    if (rating !== undefined && rating !== null && !isValidRating(rating)) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }
    const review = await reviewModel.update(req.params.id, { body, rating, tags });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

module.exports = { listBySpot, create, update };
