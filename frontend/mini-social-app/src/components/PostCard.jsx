/**
 * @file PostCard.jsx
 * @description Individual post card with optimistic like/comment updates.
 * Likes and comments update the UI instantly before the API call completes.
 */
import {
  Card, CardContent, CardMedia, Typography, IconButton,
  Box, TextField, Avatar, Collapse, Divider, Snackbar, Alert,
  Chip, useTheme, useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liking, setLiking] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const isLiked = post.likes?.some(l => l.userId === user?.userId);

  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';
  const commentBg = darkMode ? '#2a2a2a' : '#f5f7fa';

  const isPortrait = imgSize.h > imgSize.w * 1.1;
  const objectFit = isPortrait ? 'contain' : 'cover';
  const maxHeight = isPortrait ? '85vh' : { xs: 300, sm: 500 };

  /**
   * Optimistic like — updates UI immediately, then syncs with server.
   * If server fails, rolls back to previous state.
   */
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    // --- Optimistic update ---
    const wasLiked = post.likes?.some(l => l.userId === user?.userId);
    const optimisticPost = {
      ...post,
      likes: wasLiked
        ? post.likes.filter(l => l.userId !== user?.userId)          // unlike
        : [...post.likes, { userId: user?.userId, username: user?.username }] // like
    };
    onUpdate(optimisticPost); // instant UI

    try {
      const { data } = await api.post(`/api/posts/${post._id}/like`);
      onUpdate(data); // sync with real server data
    } catch {
      onUpdate(post); // rollback on error
    } finally {
      setLiking(false);
    }
  };

  /**
   * Optimistic comment — appends comment to UI instantly.
   */
  const handleComment = async () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment(''); // clear input immediately

    // --- Optimistic update ---
    const optimisticComment = {
      userId: user?.userId,
      username: user?.username,
      text,
      createdAt: new Date().toISOString()
    };
    const optimisticPost = {
      ...post,
      comments: [...(post.comments || []), optimisticComment]
    };
    onUpdate(optimisticPost);
    setShowComments(true);

    try {
      const { data } = await api.post(`/api/posts/${post._id}/comment`, { text });
      onUpdate(data); // sync with server (gets proper _id etc.)
    } catch {
      onUpdate(post); // rollback
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/?post=' + post._id)
      .then(() => setCopied(true));
  };

  const formatTime = (date) => {
    const d = new Date(date);
    if (isMobile) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Stable keys so React never remounts on resize
  const actions = [
    {
      id: 'like',
      label: 'Like',
      icon: isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />,
      color: isLiked ? '#e53935' : 'text.secondary',
      hoverBg: isLiked ? '#fce4ec' : (darkMode ? '#2a2a2a' : '#f5f5f5'),
      onClick: handleLike
    },
    {
      id: 'comment',
      label: 'Comment',
      icon: <ChatBubbleOutlineIcon fontSize="small" />,
      color: showComments ? '#1976d2' : 'text.secondary',
      hoverBg: darkMode ? '#2a2a2a' : '#f5f5f5',
      onClick: () => setShowComments(!showComments)
    },
    {
      id: 'share',
      label: 'Share',
      icon: <ShareOutlinedIcon fontSize="small" />,
      color: 'text.secondary',
      hoverBg: darkMode ? '#2a2a2a' : '#f5f5f5',
      onClick: handleShare
    }
  ];

  return (
    <Card elevation={0} sx={{
      mb: { xs: 1.5, sm: 2 }, borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.08)' }
    }}>
      <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
            <Avatar sx={{
              width: { xs: 38, sm: 44 }, height: { xs: 38, sm: 44 },
              bgcolor: '#1976d2', fontWeight: 800, fontSize: { xs: 15, sm: 17 },
              boxShadow: '0 2px 8px rgba(25,118,210,0.25)'
            }}>
              {post.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: 13, sm: 15 }, lineHeight: 1.3 }}>
                {post.username}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight={600} display="block"
                sx={{ fontSize: { xs: 11, sm: 12 } }}>@{post.username}</Typography>
              <Typography variant="caption" color="text.secondary"
                sx={{ fontSize: { xs: 10, sm: 11 } }}>{formatTime(post.createdAt)}</Typography>
            </Box>
          </Box>
          <Chip label="Follow" size="small" onClick={() => {}}
            sx={{
              bgcolor: '#1976d2', color: '#fff', fontWeight: 700,
              fontSize: { xs: 10, sm: 11 }, height: { xs: 24, sm: 26 },
              borderRadius: 5, cursor: 'pointer',
              '&:hover': { bgcolor: '#1565c0' }, '& .MuiChip-label': { px: 1.2 }
            }}
          />
        </Box>
        {post.text && (
          <Typography variant="body2" mt={1.5}
            sx={{ lineHeight: 1.75, fontSize: { xs: 13, sm: 14 }, color: darkMode ? '#e0e0e0' : '#2d3748' }}>
            {post.text}
          </Typography>
        )}
      </CardContent>

      {post.imageUrl && (
        <Box sx={{
          width: '100%',
          bgcolor: darkMode ? '#111' : '#f0f0f0',
          display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
        }}>
          <Box component="img" src={post.imageUrl} alt="post image"
            onLoad={(e) => setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            sx={{ width: '100%', maxHeight, objectFit, objectPosition: 'center', display: 'block', cursor: 'pointer' }}
          />
        </Box>
      )}

      <CardContent sx={{ pt: 1, pb: '10px !important', px: { xs: 1.5, sm: 2 } }}>
        {(post.likes?.length > 0 || post.comments?.length > 0) && (
          <Box display="flex" justifyContent="space-between" mb={0.8}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 12 } }}>
              {post.likes?.length > 0 && `❤️ ${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary"
              sx={{ cursor: 'pointer', fontSize: { xs: 11, sm: 12 }, '&:hover': { color: '#1976d2' } }}
              onClick={() => setShowComments(!showComments)}>
              {post.comments?.length > 0 && `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 0.5, borderColor: border }} />

        <Box display="flex" alignItems="center" justifyContent="space-around" pt={0.5}>
          {actions.map(({ id, label, icon, color, hoverBg, onClick }) => (
            <Box key={id} onClick={onClick} display="flex" alignItems="center"
              gap={isMobile ? 0 : 0.8}
              sx={{
                cursor: 'pointer', color, px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 0.8 },
                borderRadius: 2, minWidth: { xs: 44, sm: 'auto' }, justifyContent: 'center',
                '&:hover': { bgcolor: hoverBg }, transition: 'all 0.15s'
              }}>
              {icon}
              {!isMobile && (
                <Typography variant="body2" fontWeight={600} fontSize={13}>{label}</Typography>
              )}
            </Box>
          ))}
        </Box>

        <Collapse in={showComments}>
          <Box mt={1.5} pt={1.5} sx={{ borderTop: '1px solid', borderColor: border }}>
            {post.comments?.map((c, i) => (
              <Box key={c._id || i} display="flex" gap={1} mb={1.2} alignItems="flex-start">
                <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: '#1976d2', fontSize: 11, fontWeight: 700 }}>
                  {c.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ bgcolor: commentBg, borderRadius: '4px 12px 12px 12px', px: 1.5, py: 0.75, flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="primary">@{c.username}</Typography>
                  <Typography variant="body2" display="block" sx={{ lineHeight: 1.5, fontSize: { xs: 12, sm: 13 } }}>{c.text}</Typography>
                </Box>
              </Box>
            ))}
            {user && (
              <Box display="flex" gap={1} alignItems="center">
                <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: '#1976d2', fontSize: 11, fontWeight: 700 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <TextField size="small" value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  fullWidth
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: { xs: 12, sm: 13 }, bgcolor: commentBg } }}
                />
                <IconButton onClick={handleComment} disabled={!comment.trim()} size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff', flexShrink: 0, '&:hover': { bgcolor: '#1565c0' }, '&:disabled': { bgcolor: '#ccc' } }}>
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
