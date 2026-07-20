const cloudinary = require('../config/cloudinary');

async function uploadImage(req, res, next) {
  try {
    if (!cloudinary.isConfigured()) {
      return res.status(503).json({ error: 'Image upload is not configured on this server' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'image file is required' });
    }

    const folder = req.body.folder === 'avatars' ? 'grubbuds/avatars' : 'grubbuds/spots';

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, uploadResult) => {
        if (err) return reject(err);
        resolve(uploadResult);
      });
      stream.end(req.file.buffer);
    });

    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImage };
