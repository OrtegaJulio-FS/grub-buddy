const express = require('express');
const usersController = require('../controllers/users.controller');
const followsController = require('../controllers/follows.controller');

const router = express.Router();

router.get('/', usersController.list);
router.get('/:id', usersController.getOne);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

// Nested under users since they're always viewed in the context of one user;
// writing/unwriting a follow still goes through /follows (see follows.routes.js).
router.get('/:id/followers', followsController.listFollowers);
router.get('/:id/following', followsController.listFollowing);
router.get('/:id/is-following/:targetId', followsController.checkIsFollowing);
router.get('/:id/overlap/:otherId', usersController.overlap);

module.exports = router;
