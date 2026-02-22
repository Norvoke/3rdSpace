import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import Group from '../models/Group';
import Post from '../models/Post';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .populate('owner', 'username displayName avatar')
      .lean();
    res.json({ groups });
  } catch {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return; }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await Group.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
    const group = await Group.create({
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim(),
      owner: req.user!._id,
      members: [req.user!._id],
      isPrivate: isPrivate || false,
    });
    const populated = await group.populate('owner', 'username displayName avatar');
    res.status(201).json({ group: populated });
  } catch {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findOne({ slug: req.params.slug })
      .populate('owner', 'username displayName avatar')
      .populate('members', 'username displayName avatar');
    if (!group) { res.status(404).json({ error: 'Group not found' }); return; }
    const posts = await Post.find({ group: group._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar');
    res.json({ group, posts });
  } catch {
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

router.post('/:slug/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findOneAndUpdate(
      { slug: req.params.slug },
      { $addToSet: { members: req.user!._id } },
      { new: true }
    );
    if (!group) { res.status(404).json({ error: 'Group not found' }); return; }
    res.json({ message: 'Joined group' });
  } catch {
    res.status(500).json({ error: 'Failed to join group' });
  }
});

router.post('/:slug/leave', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findOneAndUpdate(
      { slug: req.params.slug },
      { $pull: { members: req.user!._id } },
      { new: true }
    );
    if (!group) { res.status(404).json({ error: 'Group not found' }); return; }
    res.json({ message: 'Left group' });
  } catch {
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

export default router;
