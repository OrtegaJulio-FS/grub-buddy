const followModel = require('../models/follow.model');

async function create(req, res, next) {
  try {
    const { followedId } = req.body;
    if (!followedId) {
      return res.status(400).json({ error: 'followedId is required' });
    }
    if (String(followedId) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    const follow = await followModel.create({ followerId: req.user.id, followedId });
    res.status(201).json(follow);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already following this user' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await followModel.remove({
      followerId: req.user.id,
      followedId: req.params.userId,
    });
    if (!deleted) return res.status(404).json({ error: 'Not following this user' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listFollowers(req, res, next) {
  try {
    const followers = await followModel.findFollowers(req.params.id);
    res.json(followers);
  } catch (err) {
    next(err);
  }
}

async function listFollowing(req, res, next) {
  try {
    const following = await followModel.findFollowing(req.params.id);
    res.json(following);
  } catch (err) {
    next(err);
  }
}

async function checkIsFollowing(req, res, next) {
  try {
    const following = await followModel.isFollowing(req.params.id, req.params.targetId);
    res.json({ isFollowing: following });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, remove, listFollowers, listFollowing, checkIsFollowing };
