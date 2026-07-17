const spotModel = require('../models/spot.model');

async function list(req, res, next) {
  try {
    const { city, category } = req.query;
    const spots = await spotModel.findAll({ city, category });
    res.json(spots);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const spot = await spotModel.findById(req.params.id);
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, category, address, lat, lng, coverPhotoUrl, city } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const spot = await spotModel.create({
      name,
      category,
      address,
      lat,
      lng,
      coverPhotoUrl,
      city,
      createdBy: req.user.id, // fake user for now, see src/middleware/fakeUser.js
    });
    res.status(201).json(spot);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, category, address, lat, lng, coverPhotoUrl, city } = req.body;
    const spot = await spotModel.update(req.params.id, {
      name,
      category,
      address,
      lat,
      lng,
      coverPhotoUrl,
      city,
    });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await spotModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Spot not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
