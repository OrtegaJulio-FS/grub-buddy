const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const { isValidEmail } = require('../utils/validation');

async function signup(req, res, next) {
  try {
    const { name, email, password, bio, avatarUrl, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'email must be a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, passwordHash, bio, avatarUrl, city });
    const token = signToken({ sub: user.id, email: user.email });

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user.id, email: user.email });
    delete user.password_hash;

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
