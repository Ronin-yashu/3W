import { useEffect, useState } from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Container, CircularProgress, Avatar } from '@mui/material';
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: '#fff', color: '#000' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">📣 SocialFeed</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight="medium">@{user?.username}</Typography>
            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => navigate('/create')} sx={{ borderRadius: 2, ml: 1 }}>
              Post
            </Button>
            <Button startIcon={<LogoutIcon />} size="small" onClick={handleLogout} color="inherit">
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
        ) : posts.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" mt={6}>No posts yet. Be the first to post!</Typography>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} onUpdate={handleUpdate} />)
        )}
      </Container>
    </Box>
  );
}
