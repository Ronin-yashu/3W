import { Card, CardContent, CardMedia, Typography, IconButton, Box, TextField, Button, Avatar, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
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

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e8eaf0', overflow: 'hidden', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 42, height: 42, bgcolor: '#667eea', fontWeight: 700 }}>
            {post.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>@{post.username}</Typography>
            <Typography variant="caption" color="text.secondary">{timeAgo(post.createdAt)}</Typography>
          </Box>
        </Box>
        {post.text && (
          <Typography variant="body1" mt={1.5} sx={{ lineHeight: 1.6, color: '#2d3748' }}>{post.text}</Typography>
        )}
      </CardContent>

      {post.imageUrl && (
        <CardMedia component="img" image={post.imageUrl}
          sx={{ maxHeight: 420, objectFit: 'cover', cursor: 'pointer' }} />
      )}

      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton onClick={handleLike} size="small"
            sx={{ color: isLiked ? '#e53935' : '#888', '&:hover': { color: '#e53935', bgcolor: '#fce4ec' } }}>
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
          <Typography variant="body2" color="text.secondary" mr={1}>{post.likes?.length || 0}</Typography>

          <IconButton onClick={() => setShowComments(!showComments)} size="small"
            sx={{ color: showComments ? '#667eea' : '#888', '&:hover': { color: '#667eea', bgcolor: '#ede7f6' } }}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">{post.comments?.length || 0}</Typography>
        </Box>

        <Collapse in={showComments}>
          <Box mt={1.5} sx={{ borderTop: '1px solid #f0f0f0', pt: 1.5 }}>
            {post.comments?.length > 0 && (
              <Box mb={1.5}>
                {post.comments.map((c, i) => (
                  <Box key={i} display="flex" gap={1} mb={1} alignItems="flex-start">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#764ba2', fontSize: 12 }}>
                      {c.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, px: 1.5, py: 0.75, flex: 1 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#667eea' }}>@{c.username}</Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{c.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            {user && (
              <Box display="flex" gap={1} alignItems="center">
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#667eea', fontSize: 13 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <TextField size="small" value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  fullWidth
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: 14 } }}
                />
                <IconButton onClick={handleComment} size="small"
                  sx={{ bgcolor: '#667eea', color: '#fff', '&:hover': { bgcolor: '#5a6fd6' } }}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
