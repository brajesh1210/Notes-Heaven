import { verifyToken, COOKIE_NAME } from '../utils/token.js';
import { ApiError, unauthorized } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * The token is accepted from two places:
 *  1. httpOnly cookie (browser app - recommended)
 *  2. Authorization: Bearer <token>  (Postman / mobile clients)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  const header = req.headers.authorization || '';
  if (!token && header.startsWith('Bearer ')) token = header.split(' ')[1];

  if (!token) throw unauthorized('Authentication required - no token provided');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Session expired, please sign in again' : 'Invalid token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw unauthorized('The user for this token no longer exists');

  req.user = user;
  req.userId = user._id;
  next();
});

/** Optional auth - for public routes such as the landing page */
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
