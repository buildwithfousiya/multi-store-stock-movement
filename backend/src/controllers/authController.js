const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: 'shopper' });
    res.status(201).json({
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (error) {

  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error:'Email and password required'});
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials', });
    }

    res.json({
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (error) {
  }
};

module.exports = { register, login };
