import { verifyToken, COOKIE_NAME } from '../utils/token.js';
import { ApiError, unauthorized } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * Token do jagah se accept karta hai:
 *  1. httpOnly cookie (browser app ke liye - recommended)
 *  2. Authorization: Bearer <token>  (Postman / mobile ke liye)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  const header = req.headers.authorization || '';
  if (!token && header.startsWith('Bearer ')) token = header.split(' ')[1];

  if (!token) throw unauthorized('Login karo pehle - token nahi mila');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Session expire ho gaya, dobara login karo' : 'Token invalid hai');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw unauthorized('Is token ka user exist nahi karta');

  req.user = user;
  req.userId = user._id;
  next();
});

/** Optional auth - landing page jaise public routes ke liye */
export const maybeAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id);
      if (req.user) req.userId = req.user._id;
    } catch {
      /* ignore */
    }
  }
  next();
});
