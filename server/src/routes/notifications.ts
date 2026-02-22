import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'username displayName avatar')
      .populate('post', '_id');
    const unreadCount = await Notification.countDocuments({ recipient: req.user!._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ recipient: req.user!._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

router.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!._id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
