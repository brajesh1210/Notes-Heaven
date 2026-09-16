import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env, features } from '../config/env.js';

export const signToken = (userId) =>
  jwt.sign({ id: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

/** Random raw reset token + its sha256 hash (only the hash is stored in the DB) */
export const createResetToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

export const COOKIE_NAME = 'nh_token';

/** httpOnly cookie options - keeps the token safe from XSS */
export const cookieOptions = () => ({
  httpOnly: true,
  secure: features.isProd,
  sameSite: features.isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});
