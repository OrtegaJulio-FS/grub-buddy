const express = require('express');
const upload = require('../middleware/upload');
const uploadsController = require('../controllers/uploads.controller');

const router = express.Router();

// Wraps multer directly (rather than using it as router-level middleware) so
// file-too-large / wrong-mimetype errors return a clear 400 instead of
// falling through to the generic 500 handler.
router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    uploadsController.uploadImage(req, res, next);
  });
});

module.exports = router;
