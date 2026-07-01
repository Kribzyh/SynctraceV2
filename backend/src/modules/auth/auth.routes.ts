import { Router } from "express";
import passport from "passport";

import { createHttpError } from "../../middleware/errorHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account"
  })
);

authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (error, profile) => {
    if (error) {
      next(error);
      return;
    }

    if (!profile) {
      next(createHttpError(401, "GOOGLE_AUTH_FAILED", "Google authentication failed."));
      return;
    }

    res.locals.googleProfile = profile;
    void authController.googleCallback(req, res, next);
  })(req, res, next);
});

authRouter.post("/complete-profile", authenticate, authController.completeProfile);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/me", authenticate, authController.me);
