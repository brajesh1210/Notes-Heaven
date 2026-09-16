import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env, features } from './env.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Google OAuth strategy. Env me CLIENT_ID/SECRET na ho to silently skip
 * ho jata hai (app crash nahi karta, sirf Google button hide ho jata hai).
 */
export const configurePassport = () => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  if (!features.googleOAuth) {
    logger.warn('Google OAuth disabled (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)');
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google account me email nahi mila'), null);

          let user = await User.findOne({ email }).select('+googleId');

          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email,
              avatar: profile.photos?.[0]?.value || '',
              provider: 'google',
              googleId: profile.id,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
            await user.save({ validateBeforeSave: false });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  logger.success('Google OAuth strategy ready');
  return passport;
};

export default configurePassport;
