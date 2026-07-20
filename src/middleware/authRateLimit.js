const rateLimit = require('express-rate-limit');

// Blunt protection against credential-stuffing/brute-force on signup+login -
// 10 attempts per IP per 15 minutes. Applies to both routes together (an
// attacker gets 10 total guesses, not 10 of each).
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
});

module.exports = authRateLimit;
