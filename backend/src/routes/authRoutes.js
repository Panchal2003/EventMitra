import { Router } from "express";
import { getProfile, login, register, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createToken } from "../utils/createToken.js";
import passport from "../middleware/passport.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authenticate, getProfile);
authRoutes.put("/me", authenticate, updateProfile);

// Google OAuth routes - with role support
authRoutes.get("/google", (req, res, next) => {
  const role = req.query.role || "customer";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: JSON.stringify({ role })
  })(req, res, next);
});

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_auth_failed` }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = req.user ? createToken({ userId: req.user._id, role: req.user.role }) : null;
    const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
    
    // Check if user is new (just created) by checking if they have a phone number
    const isNewUser = !req.user.phone;
    
    if (isNewUser) {
      // New user - redirect to login page with prefill data
      const prefillData = encodeURIComponent(JSON.stringify({
        name: req.user.name,
        email: req.user.email
      }));
      res.redirect(`${redirectUrl}/login?token=${token}&new=true&prefill=${prefillData}`);
    } else {
      // Existing user - redirect to appropriate dashboard
      let redirectPath = "/";
      if (req.user?.role === "admin") {
        redirectPath = "/admin";
      } else if (req.user?.role === "serviceProvider") {
        redirectPath = "/provider";
      }
      res.redirect(`${redirectUrl}${redirectPath}?token=${token}`);
    }
  }
);
