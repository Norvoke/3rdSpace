import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Post from '../models/Post';
import { sanitizeCustomHTML, sanitizeCustomCSS } from '../utils/sanitizeProfile';

const router = Router();

// Search users
router.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const users = await User.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('username displayName avatar bio');

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get user profile by username
router.get('/:username', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-googleId -__v')
      .populate('friends', 'username displayName avatar');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isOwner = req.user?._id.toString() === user._id.toString();
    const isFriend = req.user
      ? user.friends.some((f: any) => f._id.toString() === req.user!._id.toString())
      : false;

    if (user.isPrivate && !isOwner && !isFriend) {
      res.json({
        user: {
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isPrivate: true,
        },
      });
      return;
    }

    // Get wall posts (posts targeting this profile)
    const wallPosts = await Post.find({ targetProfile: user._id })
      .sort({ createdAt: -1 }) // ALWAYS chronological
      .limit(10)
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar');

    res.json({ user, wallPosts, isOwner, isFriend });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update own profile
router.put('/me/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = [
      'displayName', 'bio', 'location', 'website',
      'customCSS', 'customHTML', 'headerImage', 'avatar',
      'bannerColor', 'bannerPattern', 'bannerPatternColor', 'bannerPatternScale',
      'mood', 'interests', 'isPrivate',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.customHTML !== undefined) updates.customHTML = sanitizeCustomHTML(updates.customHTML);
    if (updates.customCSS !== undefined) updates.customCSS = sanitizeCustomCSS(updates.customCSS);

    // Empty string means "clear it and go back to the default banner" —
    // bannerColor's schema-level regex would otherwise reject ''.
    const unset: Record<string, ''> = {};
    for (const field of ['bannerColor', 'bannerPattern', 'bannerPatternColor']) {
      if (updates[field] === '') {
        delete updates[field];
        unset[field] = '';
      }
    }

    const updateOp: Record<string, any> = { $set: updates };
    if (Object.keys(unset).length) updateOp.$unset = unset;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updateOp,
      { new: true, runValidators: true }
    ).select('-googleId -__v');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update username
router.put('/me/username', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;
    if (!username || !/^[a-z0-9_]{3,30}$/.test(username)) {
      res.status(400).json({ error: 'Invalid username. Use 3-30 chars: lowercase letters, numbers, underscores.' });
      return;
    }

    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== req.user!._id.toString()) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { username },
      { new: true }
    ).select('-googleId -__v');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update username' });
  }
});

export default router;
