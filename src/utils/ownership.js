// Shared ownership check for controllers: does this resource (a row with a
// user_id column - a log, a review's log, a list) belong to the requester?
// Reads req.user.id, which fakeUser.js sets today and requireAuth will set
// once real auth is wired in - these checks don't change either way.
function isOwnedBy(resource, userId) {
  return Boolean(resource) && String(resource.user_id) === String(userId);
}

module.exports = { isOwnedBy };
