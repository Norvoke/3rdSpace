import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// Get friend feed — chronological, no algorithm
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
      targetProfile: { $exists: false }, // Exclude wall posts from main feed
    })
      .sort({ createdAt: -1 }) // Strict chronological — no score, no ranking
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

// Create a post
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content, imageUrl, targetProfile, visibility } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    // Wall post validation
    if (targetProfile) {
      const target = await User.findById(targetProfile);
      if (!target) {
        res.status(404).json({ error: 'Target user not found' });
        return;
      }
    }

    const post = await Post.create({
      author: req.user!._id,
      content: content.trim(),
      imageUrl,
      targetProfile: targetProfile || undefined,
      visibility: visibility || 'friends',
    });

    const populated = await post.populate('author', 'username displayName avatar');
    res.status(201).json({ post: populated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Delete a post
router.delete('/:postId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.author.toString() !== req.user!._id.toString()) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Add a comment
router.post('/:postId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400).json({ error: 'Comment content required' });
      return;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: {
          comments: {
            _id: new mongoose.Types.ObjectId(),
            author: req.user!._id,
            content: content.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate('comments.author', 'username displayName avatar');

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Toggle like
router.post('/:postId/like', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

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
