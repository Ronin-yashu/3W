import { useEffect, useState } from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Container, CircularProgress, Avatar, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/api/posts');
      setPosts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Box bgcolor="#f0f2f5" minHeight="100vh">
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: '#fff', borderBottom: '1px solid #e8eaf0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={800}
            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📣 SocialFeed
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Chip
              avatar={<Avatar sx={{ bgcolor: '#667eea !important', fontSize: '12px !important' }}>{user?.username?.[0]?.toUpperCase()}</Avatar>}
              label={`@${user?.username}`}
              variant="outlined"
              sx={{ borderColor: '#667eea', color: '#667eea', fontWeight: 600 }}
            />
            <Button startIcon={<AddIcon />} variant="contained" size="small"
              onClick={() => navigate('/create')}
              sx={{ borderRadius: 2, fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                '&:hover': { background: 'linear-gradient(135deg, #5a6fd6, #6a3d94)' }
              }}>Post</Button>
            <Button startIcon={<LogoutIcon />} size="small" onClick={handleLogout}
              sx={{ color: '#888', '&:hover': { color: '#333' } }}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress sx={{ color: '#667eea' }} /></Box>
        ) : posts.length === 0 ? (
          <Box textAlign="center" mt={8}>
            <Typography variant="h2" mb={1}>🌟</Typography>
            <Typography variant="h6" fontWeight={600} color="text.secondary">No posts yet</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Be the first to share something!</Typography>
            <Button variant="contained" onClick={() => navigate('/create')}
              sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              Create First Post
            </Button>
          </Box>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} onUpdate={handleUpdate} />)
        )}
      </Container>
    </Box>
  );
}
