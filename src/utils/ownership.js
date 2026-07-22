// Shared ownership check for controllers: does this resource (a row with a
// user_id column - a log, a review's log, a list) belong to the requester?
// Reads req.user.id, set by middleware/auth.js's requireAuth.
function isOwnedBy(resource, userId) {
  return Boolean(resource) && String(resource.user_id) === String(userId);
}

module.exports = { isOwnedBy };
