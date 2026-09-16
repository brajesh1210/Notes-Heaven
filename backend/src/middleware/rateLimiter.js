import rateLimit from 'express-rate-limit';
import { tooMany } from '../utils/ApiError.js';

const handler = (req, res, next) => next(tooMany());

/** Login/Signup brute-force protection: 30 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Forgot password: 10 mail requests per 15 minutes */
export const mailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Image upload: 100 uploads per hour */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Global API guard: 300 requests / 5 min per IP (abuse protection for every endpoint) */
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down and try again' },
});
