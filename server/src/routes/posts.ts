import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import Post from '../models/Post';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

const router = Router();

router.get('/feed', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const currentUser = await User.findById(req.user!._id);
    const friendIds = currentUser?.friends || [];
    const posts = await Post.find({
      $or: [
        { author: { $in: [...friendIds, req.user!._id] }, visibility: { $in: ['public', 'friends'] } },
        { author: req.user!._id },
      ],
      targetProfile: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar');
    const total = await Post.countDocuments({ author: { $in: [...friendIds, req.user!._id] } });
    res.json({ posts, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content, imageUrl, targetProfile, visibility } = req.body;
    if (!content?.trim()) { res.status(400).json({ error: 'Content is required' }); return; }
    if (targetProfile) {
      const target = await User.findById(targetProfile);
      if (!target) { res.status(404).json({ error: 'Target user not found' }); return; }
    }
    const post = await Post.create({
      author: req.user!._id,
      content: content.trim(),
      imageUrl,
      targetProfile: targetProfile || undefined,
      visibility: visibility || 'friends',
    });
    if (targetProfile && targetProfile !== req.user!._id.toString()) {
      await Notification.create({ recipient: targetProfile, sender: req.user!._id, type: 'wall_post', post: post._id });
    }
    const populated = await post.populate('author', 'username displayName avatar');
    res.status(201).json({ post: populated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.delete('/:postId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.author.toString() !== req.user!._id.toString()) { res.status(403).json({ error: 'Not authorized' }); return; }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

router.post('/:postId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) { res.status(400).json({ error: 'Comment content required' }); return; }
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: { _id: new mongoose.Types.ObjectId(), author: req.user!._id, content: content.trim(), createdAt: new Date() } } },
      { new: true }
    ).populate('comments.author', 'username displayName avatar');
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    const senderId = req.user!._id.toString();
    if (post.author.toString() !== senderId) {
      await Notification.create({ recipient: post.author, sender: req.user!._id, type: 'comment', post: post._id });
    }
    if (post.targetProfile && post.targetProfile.toString() !== senderId && post.targetProfile.toString() !== post.author.toString()) {
      await Notification.create({ recipient: post.targetProfile, sender: req.user!._id, type: 'reply', post: post._id });
    }
    const notifyIds = new Set<string>();
    for (const c of post.comments.slice(0, -1)) {
      const authorId = (c.author as any)._id?.toString() || c.author.toString();
      if (authorId !== senderId && authorId !== post.author.toString()) notifyIds.add(authorId);
    }
    for (const id of notifyIds) {
      await Notification.create({ recipient: id, sender: req.user!._id, type: 'reply', post: post._id });
    }
    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/:postId/like', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    const userId = req.user!._id;
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ liked: !alreadyLiked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
