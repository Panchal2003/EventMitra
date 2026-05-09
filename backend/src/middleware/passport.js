import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { createToken } from '../utils/createToken.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
  try {
    // Parse role from state parameter
    let role = 'customer';
    if (request.query.state) {
      try {
        const state = JSON.parse(request.query.state);
        role = state.role || 'customer';
      } catch (e) {
        // State parsing failed, use default
      }
    }
    
    // Check if user already exists with this email
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }
    
    // Check if user exists with Google ID
    user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    }
    
    // Create new user with the specified role
    const newUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      // Set a random password since they'll use Google auth
      password: Math.random().toString(36).slice(-8),
      role: role, // Use the role from state parameter
      providerStatus: role === 'serviceProvider' ? 'pending' : 'approved'
    });
    
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;