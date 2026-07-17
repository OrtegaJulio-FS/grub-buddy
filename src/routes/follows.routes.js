const express = require('express');
const followsController = require('../controllers/follows.controller');

const router = express.Router();

router.post('/', followsController.create);
router.delete('/:userId', followsController.remove);

module.exports = router;
