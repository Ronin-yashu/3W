import {
  Card, CardContent, CardMedia, Typography, IconButton,
  Box, TextField, Avatar, Collapse, Divider, Snackbar, Alert, Chip
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
  const [liking, setLiking] = useState(false);
  const isLiked = post.likes?.some(l => l.userId === user?.userId);

  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';
  const commentBg = darkMode ? '#2a2a2a' : '#f5f7fa';

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/api/posts/${post._id}/like`);
      onUpdate(data);
    } finally { setLiking(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const { data } = await api.post(`/api/posts/${post._id}/comment`, { text: comment });
    onUpdate(data);
    setComment('');
    setShowComments(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/?post=' + post._id)
      .then(() => setCopied(true));
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card elevation={0} sx={{
      mb: 2, borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg,
      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.08)' }
    }}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{
              width: 44, height: 44, bgcolor: '#1976d2', fontWeight: 800, fontSize: 17,
              boxShadow: '0 2px 8px rgba(25,118,210,0.3)'
            }}>
              {post.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} fontSize={14} lineHeight={1.3}>
                {post.username}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight={600} display="block">@{post.username}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize={11}>{formatTime(post.createdAt)}</Typography>
            </Box>
          </Box>
          <Chip label="Follow" size="small" onClick={() => {}}
            sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 11,
              height: 26, borderRadius: 5, cursor: 'pointer',
              '&:hover': { bgcolor: '#1565c0' }, '& .MuiChip-label': { px: 1.5 }
            }}
          />
        </Box>

        {post.text && (
          <Typography variant="body2" mt={1.5} sx={{ lineHeight: 1.75, fontSize: 14, color: darkMode ? '#e0e0e0' : '#2d3748' }}>
            {post.text}
          </Typography>
        )}
      </CardContent>

      {post.imageUrl && (
        <CardMedia component="img" image={post.imageUrl}
          sx={{ maxHeight: 400, objectFit: 'cover', cursor: 'pointer' }} />
      )}

      <CardContent sx={{ pt: 1, pb: '10px !important' }}>
        {/* Reaction Summary */}
        {(post.likes?.length > 0 || post.comments?.length > 0) && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              {post.likes?.length > 0 && `❤️ ${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: '#1976d2' } }}
              onClick={() => setShowComments(!showComments)}>
              {post.comments?.length > 0 && `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 0.5, borderColor: border }} />

        {/* Action Buttons */}
        <Box display="flex" alignItems="center" justifyContent="space-around" pt={0.5}>
          <Box onClick={handleLike} display="flex" alignItems="center" gap={0.8} sx={{
            cursor: 'pointer', color: isLiked ? '#e53935' : 'text.secondary', px: 2, py: 0.8, borderRadius: 2,
            '&:hover': { bgcolor: isLiked ? '#fce4ec' : (darkMode ? '#2a2a2a' : '#f5f5f5') }, transition: 'all 0.15s'
          }}>
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            <Typography variant="body2" fontWeight={600} fontSize={13}>Like</Typography>
          </Box>

          <Box onClick={() => setShowComments(!showComments)} display="flex" alignItems="center" gap={0.8} sx={{
            cursor: 'pointer', color: showComments ? '#1976d2' : 'text.secondary', px: 2, py: 0.8, borderRadius: 2,
            '&:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5' }, transition: 'all 0.15s'
          }}>
            <ChatBubbleOutlineIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600} fontSize={13}>Comment</Typography>
          </Box>

          <Box onClick={handleShare} display="flex" alignItems="center" gap={0.8} sx={{
            cursor: 'pointer', color: 'text.secondary', px: 2, py: 0.8, borderRadius: 2,
            '&:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5' }, transition: 'all 0.15s'
          }}>
            <ShareOutlinedIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600} fontSize={13}>Share</Typography>
          </Box>
        </Box>

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Box mt={1.5} pt={1.5} sx={{ borderTop: '1px solid', borderColor: border }}>
            {post.comments?.length > 0 && (
              <Box mb={1.5}>
                {post.comments.map((c, i) => (
                  <Box key={i} display="flex" gap={1} mb={1.2} alignItems="flex-start">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 12, fontWeight: 700 }}>
                      {c.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ bgcolor: commentBg, borderRadius: '4px 12px 12px 12px', px: 1.5, py: 1, flex: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="primary">@{c.username}</Typography>
                      <Typography variant="body2" display="block" sx={{ lineHeight: 1.5, fontSize: 13 }}>{c.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            {user && (
              <Box display="flex" gap={1} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 12, fontWeight: 700 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <TextField size="small" value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  fullWidth
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 13, bgcolor: commentBg } }}
                />
                <IconButton onClick={handleComment} size="small"
                  disabled={!comment.trim()}
                  sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565c0' }, '&:disabled': { bgcolor: '#ccc' } }}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>🔗 Link copied!</Alert>
      </Snackbar>
    </Card>
  );
}
