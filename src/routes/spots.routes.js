const express = require('express');
const spotsController = require('../controllers/spots.controller');

const router = express.Router();

router.get('/', spotsController.list);
router.get('/:id', spotsController.getOne);
router.post('/', spotsController.create);
router.put('/:id', spotsController.update);
router.delete('/:id', spotsController.remove);

module.exports = router;
