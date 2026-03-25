/**
 * @file posts.js
 * @description Post routes — CRUD, like/unlike toggle, comments, cursor-based pagination
 */
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Store uploaded images in memory before sending to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/posts
 * Returns paginated posts (newest first).
 * Supports cursor-based pagination via `?cursor=<lastPostId>&limit=<n>`
 * Also supports `?sort=likes|comments` for filtered feeds.
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50 per page
    const { cursor, sort } = req.query;

    // Build query — if cursor provided, fetch posts older than that ID
    const query = cursor ? { _id: { $lt: cursor } } : {};

    let posts = await Post.find(query)
      .sort({ _id: -1 }) // newest first
      .limit(limit + 1)  // fetch one extra to check if more pages exist
      .lean();            // plain JS objects — faster than Mongoose docs

    // Determine if there are more posts beyond this page
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop(); // remove the extra item

    // Client-side sort options (likes / comments)
    if (sort === 'likes') {
      posts.sort((a, b) => b.likes.length - a.likes.length);
    } else if (sort === 'comments') {
      posts.sort((a, b) => b.comments.length - a.comments.length);
    }

    res.json({
      posts,
      hasMore,
      nextCursor: hasMore ? posts[posts.length - 1]._id : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * POST /api/posts
 * Creates a new post. Supports optional image upload via Cloudinary.
 * Requires JWT authentication.
 */
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl;

    // Upload image to Cloudinary if provided
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Toggles like/unlike on a post for the authenticated user.
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const alreadyLiked = post.likes.some(l => l.userId.toString() === req.user.id);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(l => l.userId.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push({ userId: req.user.id, username: req.user.username });
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

/**
 * POST /api/posts/:id/comment
 * Adds a comment to a post.
 */
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      userId: req.user.id,
      username: req.user.username,
      text: text.trim()
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
