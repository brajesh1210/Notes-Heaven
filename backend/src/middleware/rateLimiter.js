import rateLimit from 'express-rate-limit';
import { tooMany } from '../utils/ApiError.js';

const handler = (req, res, next) => next(tooMany());

/** Login/Signup brute-force protection: 15 min me 30 attempts */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Forgot password: 15 min me 10 mail requests */
export const mailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Image upload: 1 hour me 100 uploads */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
