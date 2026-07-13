const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized — no token provided', code: 'NO_TOKEN' },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authorized — user not found', code: 'USER_NOT_FOUND' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'invalid token'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({error:'admin access required'});
  }
  next();
};

module.exports = { protect, adminOnly };
