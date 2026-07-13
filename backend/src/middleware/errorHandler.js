const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
    code = 'VALIDATION_ERROR';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for: ${field}`;
    code = 'DUPLICATE_KEY';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'INVALID_ID';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  res.status(statusCode).json({
    success: false,
    error: { message, code },
  });
};

module.exports = errorHandler;
