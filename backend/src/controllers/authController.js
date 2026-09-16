import User from '../models/User.js';
import Folder from '../models/Folder.js';
import Note from '../models/Note.js';
import Tag from '../models/Tag.js';
import { signToken, cookieOptions, createResetToken, hashToken } from '../utils/token.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, unauthorized, notFound, conflict } from '../utils/ApiError.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/mailer.js';
import { features, env } from '../config/env.js';
import logger from '../utils/logger.js';

const setAuthCookie = (res, userId) => {
  res.cookie('nh_token', signToken(userId), cookieOptions());
};

/** Starter folders so a new user never lands on an empty dashboard */
const createStarterFolders = async (userId) => {
  const names = ['Class 12', 'JEE Preparation', 'Personal', 'Work'];
  return Folder.insertMany(
    names.map((name) => ({ user: userId, name, parent: null, ancestors: [], path: name, depth: 0 }))
  );
};

// ------------------------------------------------------------------
// POST /api/auth/register
// ------------------------------------------------------------------
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email: String(email).toLowerCase() })) {
    throw conflict('This email is already registered. Please sign in or use a different email.');
  }

  const user = await User.create({ name, email, password, provider: 'local' });
  await createStarterFolders(user._id);

  setAuthCookie(res, user._id);

  sendWelcomeEmail({ to: user.email, name: user.name }).catch((e) => logger.warn(`Welcome mail failed: ${e.message}`));

  return created(res, { user: user.publicProfile(), token: signToken(user._id) }, 'Account created! Welcome to Notes Heaven');
});

// ------------------------------------------------------------------
// POST /api/auth/login
// ------------------------------------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password, remember = true } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) throw unauthorized('Incorrect email or password');

  if (user.provider === 'google' && !user.password) {
    throw badRequest('This account was created with Google. Sign in with Google, or set a password via Forgot password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw unauthorized('Incorrect email or password');

  const token = signToken(user._id);
  const opts = cookieOptions();
  res.cookie('nh_token', token, remember ? opts : { ...opts, maxAge: undefined });

  return ok(res, { user: user.publicProfile(), token }, `Welcome back, ${user.name.split(' ')[0]}!`);
});

// ------------------------------------------------------------------
// POST /api/auth/logout
// ------------------------------------------------------------------
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('nh_token', { ...cookieOptions(), maxAge: undefined });
  return ok(res, {}, 'Logged out successfully');
});

// ------------------------------------------------------------------
// GET /api/auth/me
// ------------------------------------------------------------------
export const me = asyncHandler(async (req, res) => ok(res, { user: req.user.publicProfile() }, 'Profile loaded'));

// ------------------------------------------------------------------
// POST /api/auth/forgot-password
// ------------------------------------------------------------------
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email).toLowerCase();
  const user = await User.findOne({ email });

  // Security: same message whether or not the user exists (prevents email enumeration)
  const genericMsg = 'If this email is registered, a reset link has been sent. Check your inbox (and spam folder).';
  if (!user) return ok(res, { mailConfigured: features.mail }, genericMsg);

  const { raw, hashed } = createResetToken();
  user.resetPasswordToken = hashed;
  user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${raw}`;

  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
  } catch (err) {
    logger.error(`Reset mail failed: ${err.message}`);
  }

  // In dev without SMTP, print the reset link to the terminal for easy testing
  if (!features.isProd && !features.mail) {
    logger.warn(`DEV reset link (SMTP off): ${resetUrl}`);
  }

  return ok(res, { mailConfigured: features.mail, devResetUrl: features.isProd ? undefined : resetUrl }, genericMsg);
});

// ------------------------------------------------------------------
// GET /api/auth/verify-reset-token/:token
// ------------------------------------------------------------------
export const verifyResetToken = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) throw badRequest('This reset link is invalid or has expired. Please request a new one.');
  return ok(res, { email: user.email, name: user.name }, 'Link is valid');
});

// ------------------------------------------------------------------
// PUT /api/auth/reset-password/:token
// ------------------------------------------------------------------
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) throw badRequest('This reset link is invalid or has expired. Please request a new one.');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  if (user.provider === 'google' && !user.googleId) user.provider = 'local';
  await user.save();

  setAuthCookie(res, user._id);
  return ok(res, { user: user.publicProfile(), token: signToken(user._id) }, 'Password reset successfully - you are now signed in');
});

// ------------------------------------------------------------------
// PUT /api/auth/change-password  (logged in)
// ------------------------------------------------------------------
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId).select('+password');

  if (user.password) {
    const okPass = await user.comparePassword(currentPassword);
    if (!okPass) throw badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  if (user.provider === 'google') user.provider = 'local';
  await user.save();

  return ok(res, {}, 'Password updated successfully');
});

// ------------------------------------------------------------------
// PUT /api/auth/profile
// ------------------------------------------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, prefs } = req.body;
  const user = await User.findById(req.userId);

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (prefs && typeof prefs === 'object') {
    user.prefs = { ...user.prefs, ...prefs };
  }
  await user.save();

  return ok(res, { user: user.publicProfile() }, 'Profile updated successfully');
});

// ------------------------------------------------------------------
// DELETE /api/auth/account  (delete the account and all its data)
// ------------------------------------------------------------------
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw notFound('User not found');

  const id = req.userId;
  await Promise.all([
    Note.deleteMany({ user: id }),
    Folder.deleteMany({ user: id }),
    Tag.deleteMany({ user: id }),
    User.findByIdAndDelete(id),
  ]);

  res.clearCookie('nh_token', { ...cookieOptions(), maxAge: undefined });
  return ok(res, {}, 'Account and all associated data deleted');
});

// ------------------------------------------------------------------
// Google OAuth callback (called by passport)
// ------------------------------------------------------------------
export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${env.clientUrl}/login?error=google_failed`);
  }

  // create starter folders for the new user
  const folderCount = await Folder.countDocuments({ user: user._id });
  if (folderCount === 0) await createStarterFolders(user._id);

  const token = signToken(user._id);
  res.cookie('nh_token', token, cookieOptions());

  // also return the token so the SPA keeps working cross-domain (Vercel + Render)
  return res.redirect(`${env.clientUrl}/auth/callback?token=${token}`);
});

export const googleStatus = asyncHandler(async (_req, res) =>
  ok(res, { enabled: features.googleOAuth, mailerEnabled: features.mail, uploadsEnabled: features.cloudinary }, 'Auth providers')
);
