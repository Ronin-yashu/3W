/**
 * @file PostCard.jsx
 * Optimistic like/comment, delete own post, edit own post,
 * image lightbox on click, emoji picker, char counter, follow button.
 */
import {
  Card, CardContent, Typography, IconButton, Box, TextField,
  Avatar, Collapse, Divider, Snackbar, Alert, Chip, Dialog,
  useTheme, useMediaQuery, Menu, MenuItem, ListItemIcon
} from '@mui/material';
import FavoriteIcon        from '@mui/icons-material/Favorite';
import FavoriteBorderIcon  from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon   from '@mui/icons-material/ShareOutlined';
import SendIcon            from '@mui/icons-material/Send';
import MoreVertIcon        from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon   from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon    from '@mui/icons-material/EditOutlined';
import CloseIcon           from '@mui/icons-material/Close';
import CheckIcon           from '@mui/icons-material/Check';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Simple emoji list (no heavy library needed)
const EMOJIS = ['😀','😂','😍','🔥','👍','❤️','😎','🎉','😢','😡','🤔','💯','✨','🙌','😊','🥳','😭','🤣','💀','👀','🫶','💪','🥰','😴','🤯'];

export default function PostCard({ post, onUpdate, onDelete, darkMode }) {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [comment, setComment]           = useState('');
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [liking, setLiking]             = useState(false);
  const [imgSize, setImgSize]           = useState({ w: 0, h: 0 });
  const [lightbox, setLightbox]         = useState(false);   // fullscreen image
  const [menuAnchor, setMenuAnchor]     = useState(null);    // 3-dot menu
  const [editing, setEditing]           = useState(false);   // edit mode
  const [editText, setEditText]         = useState(post.text || '');
  const [saving, setSaving]             = useState(false);
  const [showEmoji, setShowEmoji]       = useState(false);   // emoji picker
  const [following, setFollowing]       = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isLiked   = post.likes?.some(l => l.userId === user?.userId);
  const isOwner   = post.username === user?.username;
  const cardBg    = darkMode ? '#1e1e1e' : '#fff';
  const border    = darkMode ? '#2a2a2a' : '#e8eaf0';
  const commentBg = darkMode ? '#2a2a2a' : '#f5f7fa';
  const isPortrait = imgSize.h > imgSize.w * 1.1;
  const MAX_CHARS = 500;

  // ---- Like (optimistic) ------------------------------------------------
  const handleLike = useCallback(async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = post.likes?.some(l => l.userId === user?.userId);
    onUpdate({
      ...post,
      likes: wasLiked
        ? post.likes.filter(l => l.userId !== user?.userId)
        : [...post.likes, { userId: user?.userId, username: user?.username }]
    });
    try {
      const { data } = await api.post(`/api/posts/${post._id}/like`);
      onUpdate(data);
    } catch { onUpdate(post); }
    finally { setLiking(false); }
  }, [liking, post, onUpdate, user]);

  // ---- Comment (optimistic) ---------------------------------------------
  const handleComment = useCallback(async () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment('');
    setShowEmoji(false);
    onUpdate({
      ...post,
      comments: [...(post.comments || []),
        { userId: user?.userId, username: user?.username, text, createdAt: new Date().toISOString() }]
    });
    setShowComments(true);
    try {
      const { data } = await api.post(`/api/posts/${post._id}/comment`, { text });
      onUpdate(data);
    } catch { onUpdate(post); }
  }, [comment, post, onUpdate, user]);

  // ---- Delete -----------------------------------------------------------
  const handleDelete = async () => {
    setMenuAnchor(null);
    try {
      await api.delete(`/api/posts/${post._id}`);
      onDelete(post._id); // remove from local list immediately
    } catch { alert('Failed to delete post'); }
  };

  // ---- Edit -------------------------------------------------------------
  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === post.text) { setEditing(false); return; }
    setSaving(true);
    try {
      const { data } = await api.patch(`/api/posts/${post._id}`, { text: editText });
      onUpdate(data);
      setEditing(false);
    } catch { alert('Failed to edit post'); }
    finally { setSaving(false); }
  };

  // ---- Follow -----------------------------------------------------------
  const handleFollow = async () => {
    if (followLoading || isOwner) return;
    setFollowLoading(true);
    setFollowing(f => !f);
    try {
      await api.post(`/api/users/${post.userId}/follow`);
    } catch { setFollowing(f => !f); }
    finally { setFollowLoading(false); }
  };

  // ---- Share ------------------------------------------------------------
  const handleShare = () =>
    navigator.clipboard.writeText(window.location.origin + '/?post=' + post._id)
      .then(() => setCopied(true));

  const formatTime = (date) => {
    const d = new Date(date);
    return isMobile
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const actions = [
    { id: 'like',    label: 'Like',    icon: isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />, color: isLiked ? '#e53935' : 'text.secondary', hoverBg: isLiked ? '#fce4ec' : (darkMode ? '#2a2a2a' : '#f5f5f5'), onClick: handleLike },
    { id: 'comment', label: 'Comment', icon: <ChatBubbleOutlineIcon fontSize="small" />, color: showComments ? '#1976d2' : 'text.secondary', hoverBg: darkMode ? '#2a2a2a' : '#f5f5f5', onClick: () => setShowComments(s => !s) },
    { id: 'share',   label: 'Share',   icon: <ShareOutlinedIcon fontSize="small" />, color: 'text.secondary', hoverBg: darkMode ? '#2a2a2a' : '#f5f5f5', onClick: handleShare },
  ];

  return (
    <>
      <Card elevation={0} sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.08)' } }}>
        <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
              <Avatar sx={{ width: { xs: 38, sm: 44 }, height: { xs: 38, sm: 44 }, bgcolor: '#1976d2', fontWeight: 800, fontSize: { xs: 15, sm: 17 }, boxShadow: '0 2px 8px rgba(25,118,210,0.25)' }}>
                {post.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: 13, sm: 15 }, lineHeight: 1.3 }}>{post.username}</Typography>
                <Typography variant="caption" color="primary" fontWeight={600} display="block" sx={{ fontSize: { xs: 11, sm: 12 } }}>@{post.username}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 11 } }}>{formatTime(post.createdAt)}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              {/* Follow / Owner menu */}
              {!isOwner ? (
                <Chip
                  label={following ? 'Following' : 'Follow'}
                  size="small"
                  onClick={handleFollow}
                  sx={{
                    bgcolor: following ? 'transparent' : '#1976d2',
                    color: following ? (darkMode ? '#aaa' : '#555') : '#fff',
                    border: following ? '1px solid' : 'none',
                    borderColor: darkMode ? '#555' : '#ccc',
                    fontWeight: 700, fontSize: { xs: 10, sm: 11 }, height: { xs: 24, sm: 26 },
                    borderRadius: 5, cursor: 'pointer',
                    '&:hover': { bgcolor: following ? (darkMode ? '#2a2a2a' : '#f5f5f5') : '#1565c0' },
                    '& .MuiChip-label': { px: 1.2 }
                  }}
                />
              ) : (
                <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)} sx={{ color: darkMode ? '#aaa' : '#888' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Post text or edit field */}
          {editing ? (
            <Box mt={1.5}>
              <TextField
                fullWidth multiline minRows={2} maxRows={8}
                value={editText}
                onChange={e => setEditText(e.target.value.slice(0, MAX_CHARS))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14, bgcolor: commentBg } }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography variant="caption" color={editText.length > MAX_CHARS - 50 ? 'error' : 'text.secondary'}>
                  {MAX_CHARS - editText.length} chars left
                </Typography>
                <Box display="flex" gap={1}>
                  <IconButton size="small" onClick={() => setEditing(false)}><CloseIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={handleSaveEdit} disabled={saving} sx={{ color: '#1976d2' }}><CheckIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
            </Box>
          ) : post.text ? (
            <Typography variant="body2" mt={1.5} sx={{ lineHeight: 1.75, fontSize: { xs: 13, sm: 14 }, color: darkMode ? '#e0e0e0' : '#2d3748' }}>
              {post.text}
            </Typography>
          ) : null}
        </CardContent>

        {/* Image with lightbox */}
        {post.imageUrl && (
          <Box sx={{ width: '100%', bgcolor: darkMode ? '#111' : '#f0f0f0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <Box component="img" src={post.imageUrl} alt="post"
              onLoad={e => setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
              onClick={() => setLightbox(true)}
              sx={{ width: '100%', maxHeight: isPortrait ? '85vh' : { xs: 300, sm: 500 }, objectFit: isPortrait ? 'contain' : 'cover', cursor: 'zoom-in', display: 'block' }}
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
                onClick={() => setShowComments(s => !s)}>
                {post.comments?.length > 0 && `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
              </Typography>
            </Box>
          )}
          <Divider sx={{ mb: 0.5, borderColor: border }} />

          <Box display="flex" alignItems="center" justifyContent="space-around" pt={0.5}>
            {actions.map(({ id, label, icon, color, hoverBg, onClick }) => (
              <Box key={id} onClick={onClick} display="flex" alignItems="center" gap={isMobile ? 0 : 0.8}
                sx={{ cursor: 'pointer', color, px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 0.8 }, borderRadius: 2, minWidth: { xs: 44, sm: 'auto' }, justifyContent: 'center', '&:hover': { bgcolor: hoverBg }, transition: 'all 0.15s' }}>
                {icon}
                {!isMobile && <Typography variant="body2" fontWeight={600} fontSize={13}>{label}</Typography>}
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
                <Box>
                  {/* Emoji picker */}
                  {showEmoji && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, p: 1, bgcolor: commentBg, borderRadius: 2, maxWidth: 280 }}>
                      {EMOJIS.map(e => (
                        <Typography key={e} component="span"
                          onClick={() => setComment(c => c + e)}
                          sx={{ fontSize: 20, cursor: 'pointer', lineHeight: 1.4, '&:hover': { transform: 'scale(1.3)' }, transition: 'transform 0.1s' }}>
                          {e}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  <Box display="flex" gap={1} alignItems="center">
                    <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: '#1976d2', fontSize: 11, fontWeight: 700 }}>
                      {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1} position="relative">
                      <TextField size="small" value={comment}
                        onChange={e => setComment(e.target.value.slice(0, 200))}
                        placeholder="Write a comment..."
                        fullWidth
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: { xs: 12, sm: 13 }, bgcolor: commentBg, pr: 4 } }}
                        InputProps={{
                          endAdornment: (
                            <IconButton size="small" onClick={() => setShowEmoji(s => !s)}
                              sx={{ position: 'absolute', right: 4, color: showEmoji ? '#1976d2' : '#aaa' }}>
                              <EmojiEmotionsOutlinedIcon fontSize="small" />
                            </IconButton>
                          )
                        }}
                      />
                      {comment.length > 150 && (
                        <Typography variant="caption" sx={{ position: 'absolute', bottom: -18, right: 0, color: comment.length >= 200 ? 'error.main' : 'text.secondary', fontSize: 10 }}>
                          {200 - comment.length} left
                        </Typography>
                      )}
                    </Box>
                    <IconButton onClick={handleComment} disabled={!comment.trim()} size="small"
                      sx={{ bgcolor: '#1976d2', color: '#fff', flexShrink: 0, '&:hover': { bgcolor: '#1565c0' }, '&:disabled': { bgcolor: '#ccc' } }}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* 3-dot menu (own posts only) */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 140, bgcolor: darkMode ? '#1e1e1e' : '#fff', border: '1px solid', borderColor: darkMode ? '#2a2a2a' : '#e8eaf0' } }}>
        <MenuItem onClick={() => { setEditing(true); setEditText(post.text || ''); setMenuAnchor(null); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2" fontWeight={600}>Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#e53935' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" sx={{ color: '#e53935' }} /></ListItemIcon>
          <Typography variant="body2" fontWeight={600}>Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Image Lightbox */}
      <Dialog open={lightbox} onClose={() => setLightbox(false)} maxWidth={false}
        PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', boxShadow: 'none', borderRadius: 0, m: 0 } }}
        sx={{ '& .MuiDialog-container': { alignItems: 'center' } }}>
        <Box position="relative">
          <IconButton onClick={() => setLightbox(false)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', zIndex: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}>
            <CloseIcon />
          </IconButton>
          <Box component="img" src={post.imageUrl} alt="fullscreen"
            sx={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', display: 'block' }}
          />
        </Box>
      </Dialog>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>🔗 Link copied!</Alert>
      </Snackbar>
    </>
  );
}
