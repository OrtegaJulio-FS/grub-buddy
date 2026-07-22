// Reads the JWT from an httpOnly cookie instead of a JS-visible response body
// or Authorization header - keeps the token out of reach of any XSS on the
// frontend. `secure` is gated on NODE_ENV since local dev talks over plain
// http; `sameSite: 'lax'` is enough here because the frontend and API are
// always the same registrable domain (different ports don't count against
// SameSite), just not identical origins.
const COOKIE_NAME = 'token';
const DEFAULT_EXPIRES_IN = '7d';

const UNIT_MS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

function parseExpiryMs(value) {
  if (typeof value === 'number') return value * 1000;
  const match = /^(\d+)([smhd])$/.exec(String(value));
  if (!match) return UNIT_MS.d * 7;
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: parseExpiryMs(process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN),
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
