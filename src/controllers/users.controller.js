const userModel = require('../models/user.model');
const spotModel = require('../models/spot.model');
const bcrypt = require('bcrypt');

async function list(req, res, next) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Plain CRUD create for testing - no auth, expects a password in the body just
// like signup would. Kept separate from src/controllers/auth.controller.js.
async function create(req, res, next) {
  try {
    const { name, email, password, bio, avatarUrl, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, passwordHash, bio, avatarUrl, city });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, bio, avatarUrl, city } = req.body;
    const user = await userModel.update(req.params.id, { name, bio, avatarUrl, city });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await userModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function overlap(req, res, next) {
  try {
    const spots = await spotModel.findOverlap(req.params.id, req.params.otherId);
    res.json(spots);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, overlap };
