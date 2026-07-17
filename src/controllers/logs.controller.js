const logModel = require('../models/log.model');

async function list(req, res, next) {
  try {
    const { userId, spotId } = req.query;
    const logs = await logModel.findAll({ userId, spotId });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const log = await logModel.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { spotId, rating, visitedAt, quickNote, photoUrl } = req.body;
    if (!spotId || rating === undefined) {
      return res.status(400).json({ error: 'spotId and rating are required' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }
    const log = await logModel.create({
      userId: req.user.id, // fake user for now, see src/middleware/fakeUser.js
      spotId,
      visitedAt,
      rating,
      quickNote,
      photoUrl,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { rating, quickNote, photoUrl, visitedAt } = req.body;
    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }
    const log = await logModel.update(req.params.id, { rating, quickNote, photoUrl, visitedAt });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await logModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Log not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
