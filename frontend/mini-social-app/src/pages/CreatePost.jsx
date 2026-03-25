import { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Container,
  AppBar, Toolbar, IconButton, CircularProgress, Divider,
  useTheme, useMediaQuery, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardBg = isDark ? '#1e1e1e' : '#fff';
  const border = isDark ? '#2a2a2a' : '#e8eaf0';
  const bg = isDark ? '#121212' : '#f5f7fa';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) { setError('Please add text or an image.'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text);
      if (image) formData.append('image', image);
      await api.post('/api/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally { setLoading(false); }
  };

  return (
    <Box bgcolor={bg} minHeight="100vh">
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: cardBg, borderBottom: '1px solid', borderColor: border }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton onClick={() => navigate('/')} edge="start" sx={{ color: '#1976d2' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} ml={1} color="primary"
            sx={{ fontSize: { xs: 17, sm: 20 } }}>New Post</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2 } }}>
        {/* Author info banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          mb: 2, p: { xs: 1.5, sm: 2 },
          bgcolor: isDark ? '#1e1e1e' : '#e3f2fd',
          borderRadius: 3, border: '1px solid', borderColor: isDark ? '#2a2a2a' : '#bbdefb'
        }}>
          <Box sx={{
            width: { xs: 36, sm: 42 }, height: { xs: 36, sm: 42 },
            borderRadius: '50%', bgcolor: '#1976d2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: { xs: 15, sm: 18 }, flexShrink: 0
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: 13, sm: 15 } }}>@{user?.username}</Typography>
            <Typography variant="caption" color="text.secondary">Posting publicly</Typography>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, overflow: 'hidden' }}>
          <Box p={{ xs: 2, sm: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField
                placeholder="What's on your mind?"
                multiline rows={isMobile ? 4 : 5} fullWidth
                value={text} onChange={e => setText(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: { xs: 14, sm: 15 } },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
                }}
              />
              {preview && (
                <Box mb={2} position="relative">
                  <img src={preview} alt="preview"
                    style={{ width: '100%', borderRadius: 10, maxHeight: isMobile ? 220 : 300, objectFit: 'cover' }} />
                  <IconButton onClick={() => { setImage(null); setPreview(null); }} size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Button component="label" startIcon={<ImageIcon />} variant="outlined" size={isMobile ? 'small' : 'medium'}
                  sx={{ borderRadius: 5, borderColor: '#1976d2', color: '#1976d2', textTransform: 'none', fontWeight: 600,
                    '&:hover': { borderColor: '#1565c0', bgcolor: '#e3f2fd' } }}>
                  {image ? 'Change' : 'Add Photo'}
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
                <Button type="submit" variant="contained" size={isMobile ? 'medium' : 'large'}
                  endIcon={!loading && <SendIcon />} disabled={loading}
                  sx={{ borderRadius: 5, px: { xs: 3, sm: 4 }, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px rgba(25,118,210,0.3)' }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Publish Post'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
