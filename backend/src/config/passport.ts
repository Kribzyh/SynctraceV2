import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { authConfig } from "./auth.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: authConfig.GOOGLE_CLIENT_ID,
      clientSecret: authConfig.GOOGLE_CLIENT_SECRET,
      callbackURL: authConfig.GOOGLE_REDIRECT_URI
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value ?? null;
      const pictureUrl = profile.photos?.[0]?.value ?? null;

      if (!email) {
        done(undefined, false, { message: "Google profile did not include an email address." });
        return;
      }

      done(null, {
        googleId: profile.id,
        email,
        name: profile.displayName || email,
        pictureUrl
      } as never);
    }
  )
);

export const passportMiddleware = passport.initialize();