import { Card, CardContent, CardMedia, Typography, IconButton, Box, TextField, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const headers = { Authorization: `Bearer ${user?.token}` };

  const handleLike = async () => {
    const { data } = await axios.post(`/api/posts/${post._id}/like`, {}, { headers });
    onUpdate(data);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const { data } = await axios.post(`/api/posts/${post._id}/comment`, { text: comment }, { headers });
    onUpdate(data);
    setComment('');
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight="bold">@{post.username}</Typography>
        {post.text && <Typography variant="body1" mt={1}>{post.text}</Typography>}
      </CardContent>
      {post.imageUrl && <CardMedia component="img" image={post.imageUrl} sx={{ maxHeight: 400, objectFit: 'cover' }} />}
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handleLike} color="error"><FavoriteIcon /></IconButton>
          <Typography>{post.likes.length} Likes</Typography>
          <Typography ml={2}>💬 {post.comments.length} Comments</Typography>
        </Box>
        {post.comments.map((c, i) => (
          <Typography key={i} variant="body2"><b>@{c.username}:</b> {c.text}</Typography>
        ))}
        {user && (
          <Box display="flex" gap={1} mt={1}>
            <TextField size="small" value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." fullWidth />
            <Button variant="contained" onClick={handleComment}>Post</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}