const express = require('express');
const authController = require('../controllers/auth.controller');
const authRateLimit = require('../middleware/authRateLimit');

const router = express.Router();

router.post('/signup', authRateLimit, authController.signup);
router.post('/login', authRateLimit, authController.login);

module.exports = router;
