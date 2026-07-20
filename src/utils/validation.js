const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email);
}

// Parses a query param as a positive integer. Returns `fallback` when the
// param wasn't provided at all, or `null` when it was provided but isn't a
// valid positive integer (e.g. "abc", "-1", "3.5") - callers should 400 on
// null rather than passing NaN/garbage down to a SQL LIMIT/OFFSET, which
// Postgres rejects with an error that would otherwise surface as a 500.
function parsePositiveInt(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function isFutureDate(dateString) {
  return new Date(dateString).getTime() > Date.now();
}

// Parses limit/offset query params for list endpoints. Malformed values
// (non-integer, negative) return null - callers should 400. An
// over-the-max limit is clamped down to maxLimit rather than rejected.
function parsePagination(query, { defaultLimit = 50, maxLimit = 100 } = {}) {
  let limit = defaultLimit;
  if (query.limit !== undefined) {
    const parsed = Number(query.limit);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    limit = Math.min(parsed, maxLimit);
  }

  let offset = 0;
  if (query.offset !== undefined) {
    const parsed = Number(query.offset);
    if (!Number.isInteger(parsed) || parsed < 0) return null;
    offset = parsed;
  }

  return { limit, offset };
}

module.exports = { isValidEmail, parsePositiveInt, isFutureDate, parsePagination };
