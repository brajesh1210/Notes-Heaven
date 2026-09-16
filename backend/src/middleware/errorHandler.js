import { ApiError } from '../utils/ApiError.js';
import { features } from '../config/env.js';
import logger from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/** Converts Mongoose / JWT errors into readable messages */
const normalize = (err) => {
  if (err.name === 'CastError') return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    if (field === 'email') return new ApiError(409, 'This email is already registered. Please sign in or use a different email.');
    return new ApiError(409, `"${value}" already exists (${field})`);
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new ApiError(400, errors[0]?.message || 'Validation failed', errors);
  }
  if (err.name === 'MulterError') return new ApiError(400, `Upload error: ${err.message}`);
  return err;
};

export const errorHandler = (err, req, res, _next) => {
  const error = normalize(err);
  const status = error.statusCode || 500;

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} ->`, error.message);
    if (!features.isProd) console.error(error.stack);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 && features.isProd ? 'Internal server error, please try again later' : error.message,
    errors: error.errors || [],
    ...(features.isProd ? {} : { stack: error.stack?.split('\n').slice(0, 4) }),
  });
};
