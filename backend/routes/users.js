/**
 * @file users.js
 * @description User routes — profile, follow/unfollow, bio update
 */
import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

/** GET /api/users/:username — public profile + posts */
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const posts = await Post.find({ userId: user._id }).sort({ _id: -1 }).lean();
    res.json({ user, posts });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/** POST /api/users/:id/follow — toggle follow/unfollow */
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Cannot follow yourself' });

    const target = await User.findById(req.params.id);
    const me     = await User.findById(req.user.id);
    if (!target || !me) return res.status(404).json({ error: 'User not found' });

    const isFollowing = me.following.includes(target._id);
    if (isFollowing) {
      me.following.pull(target._id);
      target.followers.pull(me._id);
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }
    await Promise.all([me.save(), target.save()]);

    // Broadcast follow update so follower counts update live
    io.emit('follow:updated', {
      targetId: target._id,
      followersCount: target.followers.length,
      isFollowing: !isFollowing,
      byUserId: req.user.id,
    });

    res.json({
      isFollowing: !isFollowing,
      followersCount: target.followers.length,
      followingCount: me.following.length,
    });
  } catch {
    res.status(500).json({ error: 'Follow failed' });
  }
});

/** PATCH /api/users/me/bio — update bio */
router.patch('/me/bio', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio: req.body.bio?.slice(0, 160) || '' },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update bio' });
  }
});

export default router;
