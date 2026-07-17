const activityModel = require('../models/activity.model');

async function list(req, res, next) {
  try {
    const activity = await activityModel.getActivityForUser(req.user.id);
    res.json(activity);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
