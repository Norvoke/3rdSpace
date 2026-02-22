import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Notification from '../models/Notification';

const router = Router();

router.post('/request/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user!._id.toString();
    if (targetId === currentId) { res.status(400).json({ error: "You can't friend yourself" }); return; }
    const target = await User.findById(targetId);
    if (!target) { res.status(404).json({ error: 'User not found' }); return; }
    const alreadyFriends = target.friends.some(id => id.toString() === currentId);
    const requestExists = target.friendRequests.some(id => id.toString() === currentId);
    if (alreadyFriends) { res.status(409).json({ error: 'Already friends' }); return; }
    if (requestExists) { res.status(409).json({ error: 'Friend request already sent' }); return; }
    await User.findByIdAndUpdate(targetId, { $addToSet: { friendRequests: req.user!._id } });
    await Notification.create({ recipient: targetId, sender: req.user!._id, type: 'friend_request' });
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

router.post('/accept/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = req.params.userId;
    const currentUser = await User.findById(req.user!._id);
    if (!currentUser) { res.status(404).json({ error: 'User not found' }); return; }
    const hasPendingRequest = currentUser.friendRequests.some(id => id.toString() === requesterId);
    if (!hasPendingRequest) { res.status(400).json({ error: 'No pending friend request from this user' }); return; }
    await User.findByIdAndUpdate(req.user!._id, { $addToSet: { friends: requesterId }, $pull: { friendRequests: requesterId } });
    await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: req.user!._id } });
    await Notification.create({ recipient: requesterId, sender: req.user!._id, type: 'friend_accepted' });
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

router.delete('/request/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { $pull: { friendRequests: req.params.userId } });
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
});

router.delete('/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { $pull: { friends: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $pull: { friends: req.user!._id } });
    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

router.get('/requests', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate('friendRequests', 'username displayName avatar bio');
    res.json({ requests: user?.friendRequests || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;
