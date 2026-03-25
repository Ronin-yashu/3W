import { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Paper, Container, AppBar, Toolbar, IconButton, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/posts').then(({ data }) => {
      setPosts(data.filter(p => p.username === user?.username));
    }).finally(() => setLoading(false));
  }, []);

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

  return (
    <Box bgcolor="#f0f2f5" minHeight="100vh">
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e8eaf0' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} edge="start" sx={{ color: '#1976d2' }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight={700} ml={1} sx={{ color: '#1976d2' }}>Profile</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 3 }}>
        {/* Profile Header */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8eaf0', p: 3, mb: 2, textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2', fontSize: 32, fontWeight: 700, mx: 'auto', mb: 2 }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>{user?.username}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: '#1976d2' }}>@{user?.username}</Typography>
          <Box display="flex" justifyContent="center" gap={4} mt={2.5}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800}>{posts.length}</Typography>
              <Typography variant="caption" color="text.secondary">Posts</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800} sx={{ color: '#e53935' }}>{totalLikes}</Typography>
              <Typography variant="caption" color="text.secondary">Likes</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800} sx={{ color: '#1976d2' }}>{totalComments}</Typography>
              <Typography variant="caption" color="text.secondary">Comments</Typography>
            </Box>
          </Box>
        </Paper>

        {/* User Posts */}
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>My Posts</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : posts.length === 0 ? (
          <Box textAlign="center" mt={6}>
            <Typography variant="h2">📝</Typography>
            <Typography color="text.secondary" mt={1}>No posts yet</Typography>
          </Box>
        ) : (
          posts.map(post => (
            <Paper key={post._id} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8eaf0', p: 2, mb: 1.5 }}>
              <Typography variant="body1" sx={{ color: '#2d3748' }}>{post.text || '📷 Image post'}</Typography>
              {post.imageUrl && <Box mt={1}><img src={post.imageUrl} alt="post" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} /></Box>}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
                  <Typography variant="caption">{post.likes?.length || 0}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                  <Typography variant="caption">{post.comments?.length || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Container>
    </Box>
  );
}
