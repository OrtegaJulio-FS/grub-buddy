const express = require('express');
const listsController = require('../controllers/lists.controller');

const router = express.Router();

router.post('/', listsController.create);
router.get('/:id', listsController.getOne);
router.patch('/:id', listsController.update);
router.delete('/:id', listsController.remove);
router.post('/:id/items', listsController.addItem);
router.delete('/:id/items/:spotId', listsController.removeItem);

module.exports = router;
