import { Router } from 'express';
import passport from 'passport';
import * as auth from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, mailLimiter } from '../middleware/rateLimiter.js';
import { validate, body } from '../middleware/validator.js';
import { features } from '../config/env.js';

const router = Router();

router.get('/providers', auth.googleStatus);

router.post(
  '/register',
  authLimiter,
  validate(
    body('name').required('Naam daalo'),
    body('email').required('Email daalo').isEmail(),
    body('password').required('Password daalo').min(6)
  ),
  auth.register
);

router.post(
  '/login',
  authLimiter,
  validate(body('email').required('Email daalo').isEmail(), body('password').required('Password daalo')),
  auth.login
);

router.post('/logout', auth.logout);

router.get('/me', protect, auth.me);
router.put('/profile', protect, auth.updateProfile);
router.put(
  '/change-password',
  protect,
  validate(body('newPassword').required('Naya password daalo').min(6)),
  auth.changePassword
);
router.delete('/account', protect, auth.deleteAccount);

// ---- Forgot password flow ----
router.post('/forgot-password', mailLimiter, validate(body('email').required('Email daalo').isEmail()), auth.forgotPassword);
router.get('/verify-reset-token/:token', auth.verifyResetToken);
router.put('/reset-password/:token', validate(body('password').required('Naya password daalo').min(6)), auth.resetPassword);

// ---- Google OAuth (sirf tab mount karte hain jab creds ho) ----
if (features.googleOAuth) {
  router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'], prompt: 'select_account' }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed` }),
    auth.googleCallback
  );
} else {
  router.get('/google', (_req, res) =>
    res.status(503).json({
      success: false,
      message: 'Google login abhi configured nahi hai (GOOGLE_CLIENT_ID / SECRET missing).',
    })
  );
}

export default router;
