import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, AppBar, Toolbar, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: '#fff', color: '#000' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} edge="start"><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold" ml={1}>New Post</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>@{user?.username}</Typography>
          {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField placeholder="What's on your mind?" multiline rows={4} fullWidth value={text} onChange={e => setText(e.target.value)} sx={{ mb: 2 }} />
            {preview && (
              <Box mb={2}><img src={preview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }} /></Box>
            )}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button component="label" startIcon={<ImageIcon />} variant="outlined" sx={{ borderRadius: 2 }}>
                {image ? 'Change Image' : 'Add Image'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 2, px: 4 }} disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Post'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
