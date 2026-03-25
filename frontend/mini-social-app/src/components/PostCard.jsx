import {
  Card, CardContent, CardMedia, Typography, IconButton,
  Box, TextField, Avatar, Collapse, Divider, Snackbar, Alert
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate, darkMode }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLiked = post.likes?.some(l => l.userId === user?.userId);

  const handleLike = async () => {
    const { data } = await api.post(`/api/posts/${post._id}/like`);
    onUpdate(data);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const { data } = await api.post(`/api/posts/${post._id}/comment`, { text: comment });
    onUpdate(data);
    setComment('');
  };

  const handleShare = () => {
    const url = window.location.origin + '/?post=' + post._id;
    navigator.clipboard.writeText(url).then(() => setCopied(true));
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card elevation={0} sx={{
      mb: 2, borderRadius: 3,
      border: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0',
      bgcolor: darkMode ? '#1e1e1e' : '#fff',
      '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s'
    }}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 46, height: 46, bgcolor: '#1976d2', fontWeight: 700, fontSize: 18 }}>
              {post.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 15 }}>{post.username}</Typography>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 500 }}>@{post.username}</Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 11 }}>
                {timeAgo(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ bgcolor: '#1976d2', color: '#fff', px: 2, py: 0.5, borderRadius: 5, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', '&:hover': { bgcolor: '#1565c0' } }}>Follow</Box>
        </Box>
        {post.text && (
          <Typography variant="body1" mt={1.5} sx={{ lineHeight: 1.7, fontSize: 14 }}>{post.text}</Typography>
        )}
      </CardContent>

      {post.imageUrl && (
        <CardMedia component="img" image={post.imageUrl} sx={{ maxHeight: 420, objectFit: 'cover' }} />
      )}

      <Divider />

      <CardContent sx={{ py: '8px !important' }}>
        <Box display="flex" alignItems="center" justifyContent="space-around">
          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleLike}>
            <IconButton size="small" sx={{ color: isLiked ? '#e53935' : '#888', p: 0.5 }}>
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{post.likes?.length || 0}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
            <IconButton size="small" sx={{ color: showComments ? '#1976d2' : '#888', p: 0.5 }}>
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{post.comments?.length || 0}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleShare}>
            <IconButton size="small" sx={{ color: '#888', p: 0.5 }}>
              <ShareOutlinedIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Share</Typography>
          </Box>
        </Box>

        <Collapse in={showComments}>
          <Box mt={1.5} sx={{ borderTop: '1px solid', borderColor: darkMode ? '#333' : '#f0f0f0', pt: 1.5 }}>
            {post.comments?.map((c, i) => (
              <Box key={i} display="flex" gap={1} mb={1} alignItems="flex-start">
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#1976d2', fontSize: 12 }}>
                  {c.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ bgcolor: darkMode ? '#2a2a2a' : '#f5f7fa', borderRadius: 2, px: 1.5, py: 0.75, flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#1976d2' }}>@{c.username}</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: 13 }}>{c.text}</Typography>
                </Box>
              </Box>
            ))}
            {user && (
              <Box display="flex" gap={1} alignItems="center" mt={1}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#1976d2', fontSize: 12 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <TextField size="small" value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  fullWidth
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 13 } }}
                />
                <IconButton onClick={handleComment} size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565c0' } }}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>Link copied to clipboard!</Alert>
      </Snackbar>
    </Card>
  );
}
