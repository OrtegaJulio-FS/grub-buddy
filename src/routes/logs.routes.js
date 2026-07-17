const express = require('express');
const logsController = require('../controllers/logs.controller');

const router = express.Router();

router.get('/', logsController.list);
router.get('/:id', logsController.getOne);
router.post('/', logsController.create);
router.put('/:id', logsController.update);
router.delete('/:id', logsController.remove);

module.exports = router;
