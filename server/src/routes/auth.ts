import { Router, Request, Response } from 'express';
import passport from 'passport';
import { generateToken } from '../middleware/auth';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { IUser } from '../models/User';

const router = Router();

// Initiate Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  (req: Request, res: Response) => {
    const user = req.user as IUser;
    const token = generateToken(user._id.toString());
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Redirect to frontend with token — client stores it
    res.redirect(`${clientUrl}/login/callback?token=${token}`);
  }
);

router.get('/failure', (_req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/login?error=auth_failed`);
});

// Get current authenticated user
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Logout (client just drops the JWT, but this clears the session)
router.post('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
