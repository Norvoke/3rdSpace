import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

export const configurePassport = (): void => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn('⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled');
    passport.serializeUser((user: any, done) => done(null, user._id));
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await User.findById(id).select('-__v');
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback' },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value?.replace('=s96-c', '=s400-c');
          const baseUsername = (profile.displayName || email?.split('@')[0] || 'user')
            .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username })) username = `${baseUsername}${counter++}`;

          user = await User.create({ googleId: profile.id, email, username, displayName: profile.displayName || username, avatar });
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user._id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id).select('-__v');
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
