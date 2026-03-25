/**
 * @file posts.js
 * @description Post routes — CRUD, like/unlike toggle, comments, cursor-based pagination.
 * Emits WebSocket events for like and comment so all clients update in real-time.
 */
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/posts
 * Cursor-based paginated posts (newest first).
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { cursor, sort } = req.query;
    const query = cursor ? { _id: { $lt: cursor } } : {};

    let posts = await Post.find(query).sort({ _id: -1 }).limit(limit + 1).lean();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    if (sort === 'likes') posts.sort((a, b) => b.likes.length - a.likes.length);
    else if (sort === 'comments') posts.sort((a, b) => b.comments.length - a.comments.length);

    res.json({ posts, hasMore, nextCursor: hasMore ? posts[posts.length - 1]._id : null });
  } catch {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * POST /api/posts
 * Create a new post with optional image upload.
 */
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'socialfeed',
        transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }]
      });
      imageUrl = result.secure_url;
    }
    const post = await Post.create({
      userId: req.user.id,
      username: req.user.username,
      text: req.body.text,
      imageUrl
    });
    res.status(201).json(post);
  } catch {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Toggle like/unlike. Emits 'post:updated' via WebSocket to all clients.
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const alreadyLiked = post.likes.some(l => l.userId.toString() === req.user.id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(l => l.userId.toString() !== req.user.id);
    } else {
      post.likes.push({ userId: req.user.id, username: req.user.username });
    }
    await post.save();

    // Broadcast to ALL connected clients — they update the post in-place
    io.emit('post:updated', post);
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

/**
 * POST /api/posts/:id/comment
 * Add a comment. Emits 'post:updated' via WebSocket to all clients.
 */
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.user.id, username: req.user.username, text: text.trim() });
    await post.save();

    // Broadcast updated post to all connected clients
    io.emit('post:updated', post);
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
