/**
 * posts.js — CRUD + like/comment + delete/edit + WebSocket broadcasts
 */
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** GET /api/posts — cursor paginated */
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
  } catch { res.status(500).json({ error: 'Failed to fetch posts' }); }
});

/** POST /api/posts — create */
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
      userId: req.user.id, username: req.user.username,
      text: req.body.text, imageUrl
    });
    io.emit('post:new', post);
    res.status(201).json(post);
  } catch { res.status(500).json({ error: 'Failed to create post' }); }
});

/** PATCH /api/posts/:id — edit text (owner only) */
router.patch('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your post' });
    post.text = req.body.text?.slice(0, 500) ?? post.text;
    await post.save();
    io.emit('post:updated', post);
    res.json(post);
  } catch { res.status(500).json({ error: 'Edit failed' }); }
});

/** DELETE /api/posts/:id — delete (owner only) */
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your post' });
    await post.deleteOne();
    io.emit('post:deleted', req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

/** POST /api/posts/:id/like — toggle */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    const alreadyLiked = post.likes.some(l => l.userId.toString() === req.user.id);
    if (alreadyLiked) post.likes = post.likes.filter(l => l.userId.toString() !== req.user.id);
    else post.likes.push({ userId: req.user.id, username: req.user.username });
    await post.save();
    io.emit('post:updated', post);
    res.json(post);
  } catch { res.status(500).json({ error: 'Like failed' }); }
});

/** POST /api/posts/:id/comment — add */
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    post.comments.push({ userId: req.user.id, username: req.user.username, text: text.trim() });
    await post.save();
    io.emit('post:updated', post);
    res.json(post);
  } catch { res.status(500).json({ error: 'Comment failed' }); }
});

export default router;
