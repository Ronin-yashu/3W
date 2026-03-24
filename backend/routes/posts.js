import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all posts (newest first)
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
  res.json(posts);
});

// Create post (text and/or image)
router.post('/', protect, upload.single('image'), async (req, res) => {
  let imageUrl;
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI);
    imageUrl = result.secure_url;
  }
  const post = await Post.create({
    userId: req.user.id,
    username: req.user.username,
    text: req.body.text,
    imageUrl
  });
  res.json(post);
});

// Like / Unlike toggle
router.post('/:id/like', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const alreadyLiked = post.likes.some(l => l.userId.toString() === req.user.id);
  if (alreadyLiked) {
    post.likes = post.likes.filter(l => l.userId.toString() !== req.user.id);
  } else {
    post.likes.push({ userId: req.user.id, username: req.user.username });
  }
  await post.save();
  res.json(post);
});

// Comment
router.post('/:id/comment', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push({ userId: req.user.id, username: req.user.username, text: req.body.text });
  await post.save();
  res.json(post);
});

export default router;