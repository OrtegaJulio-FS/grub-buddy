const express = require('express');
const authController = require('../controllers/auth.controller');
const authRateLimit = require('../middleware/authRateLimit');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authRateLimit, authController.signup);
router.post('/login', authRateLimit, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
