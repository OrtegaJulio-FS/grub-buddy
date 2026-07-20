const listModel = require('../models/list.model');
const { isOwnedBy } = require('../utils/ownership');

async function create(req, res, next) {
  try {
    const { title, description, isPublic } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const list = await listModel.create({ userId: req.user.id, title, description, isPublic });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const list = await listModel.findById(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });
    const spots = await listModel.findSpots(req.params.id);
    res.json({ ...list, spots });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await listModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'List not found' });
    if (!isOwnedBy(existing, req.user.id)) {
      return res.status(403).json({ error: 'You can only edit your own lists' });
    }

    const { title, description, isPublic } = req.body;
    const list = await listModel.update(req.params.id, { title, description, isPublic });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await listModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'List not found' });
    if (!isOwnedBy(existing, req.user.id)) {
      return res.status(403).json({ error: 'You can only delete your own lists' });
    }

    await listModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const existing = await listModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'List not found' });
    if (!isOwnedBy(existing, req.user.id)) {
      return res.status(403).json({ error: 'You can only add spots to your own lists' });
    }

    const { spotId } = req.body;
    if (!spotId) {
      return res.status(400).json({ error: 'spotId is required' });
    }
    const item = await listModel.addItem(req.params.id, spotId);
    res.status(201).json(item);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Spot is already on this list' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'List or spot not found' });
    }
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const existing = await listModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'List not found' });
    if (!isOwnedBy(existing, req.user.id)) {
      return res.status(403).json({ error: 'You can only remove spots from your own lists' });
    }

    const removed = await listModel.removeItem(req.params.id, req.params.spotId);
    if (!removed) return res.status(404).json({ error: 'Spot not on this list' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listForUser(req, res, next) {
  try {
    const lists = await listModel.findByUserId(req.params.id);
    res.json(lists);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getOne, update, remove, addItem, removeItem, listForUser };
