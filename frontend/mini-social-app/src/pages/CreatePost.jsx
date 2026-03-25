import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, AppBar, Toolbar, IconButton, CircularProgress, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const removeImage = () => { setImage(null); setPreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) { setError('Please add text or an image.'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text);
      if (image) formData.append('image', image);
      await axios.post('/api/posts', formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally { setLoading(false); }
  };

  return (
    <Box bgcolor="#f0f2f5" minHeight="100vh">
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e8eaf0' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} edge="start" sx={{ color: '#667eea' }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight={700} ml={1}
            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            New Post
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e8eaf0' }}>
          <Box sx={{ p: 3, background: 'linear-gradient(135deg, #667eea15, #764ba215)' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#667eea' }}>@{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary">Share something with everyone</Typography>
          </Box>
          <Divider />
          <Box p={3}>
            {error && (
              <Box sx={{ bgcolor: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 2, p: 1.5, mb: 2 }}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Box>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                placeholder="What's on your mind?"
                multiline rows={4} fullWidth
                value={text} onChange={e => setText(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                }}
              />
              {preview && (
                <Box mb={2} sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 12, maxHeight: 300, objectFit: 'cover' }} />
                  <IconButton onClick={removeImage} size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Button component="label" startIcon={<ImageIcon />} variant="outlined"
                  sx={{ borderRadius: 2, borderColor: '#667eea', color: '#667eea',
                    '&:hover': { borderColor: '#5a6fd6', bgcolor: '#667eea10' } }}>
                  {image ? 'Change Image' : 'Add Image'}
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
                <Button type="submit" variant="contained" size="large" endIcon={!loading && <SendIcon />} disabled={loading}
                  sx={{ borderRadius: 2, px: 4, fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    '&:hover': { background: 'linear-gradient(135deg, #5a6fd6, #6a3d94)' }
                  }}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Post'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
