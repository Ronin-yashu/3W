import { Card, CardContent, CardMedia, Typography, IconButton, Box, TextField, Button, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const headers = { Authorization: `Bearer ${user?.token}` };

  const isLiked = post.likes?.some(l => l.userId === user?.userId);

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
    <Card sx={{ mb: 2, borderRadius: 3 }} elevation={2}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
            {post.username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">@{post.username}</Typography>
        </Box>
        {post.text && <Typography variant="body1" mt={1.5} mb={0.5}>{post.text}</Typography>}
      </CardContent>
      {post.imageUrl && (
        <CardMedia component="img" image={post.imageUrl} sx={{ maxHeight: 400, objectFit: 'cover' }} />
      )}
      <CardContent sx={{ pt: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <IconButton onClick={handleLike} size="small" color={isLiked ? 'error' : 'default'}>
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2">{post.likes?.length || 0} Likes</Typography>
          <Typography variant="body2" ml={1}>💬 {post.comments?.length || 0} Comments</Typography>
        </Box>
        {post.comments?.map((c, i) => (
          <Typography key={i} variant="body2" sx={{ mb: 0.5 }}><b>@{c.username}:</b> {c.text}</Typography>
        ))}
        {user && (
          <Box display="flex" gap={1} mt={1.5}>
            <TextField
              size="small" value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              fullWidth
              onKeyDown={e => e.key === 'Enter' && handleComment()}
            />
            <Button variant="contained" onClick={handleComment} sx={{ borderRadius: 2 }}>Post</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
