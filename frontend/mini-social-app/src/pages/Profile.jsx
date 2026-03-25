import { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Paper, Container, AppBar, Toolbar,
  IconButton, Divider, CircularProgress, useTheme, Grid, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import GridViewIcon from '@mui/icons-material/GridView';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/posts').then(({ data }) => {
      setPosts(data.filter(p => p.username === user?.username));
    }).finally(() => setLoading(false));
  }, []);

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const bg = isDark ? '#121212' : '#f5f7fa';
  const cardBg = isDark ? '#1e1e1e' : '#fff';
  const border = isDark ? '#2a2a2a' : '#e8eaf0';

  return (
    <Box minHeight="100vh" bgcolor={bg}>
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: cardBg, borderBottom: '1px solid', borderColor: border }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} edge="start" sx={{ color: '#1976d2' }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight={700} ml={1} color="primary">Profile</Typography>
        </Toolbar>
      </AppBar>

      {/* Hero Banner */}
      <Box sx={{ height: 120, background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }} />

      <Container maxWidth="sm" sx={{ mt: -6, pb: 4 }}>
        {/* Profile Card */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: border, bgcolor: cardBg, p: 3, mb: 2.5 }}>
          <Box display="flex" alignItems="flex-end" gap={2} mb={2}>
            <Avatar sx={{
              width: 80, height: 80, bgcolor: '#1976d2',
              fontSize: 32, fontWeight={800}, border: '4px solid', borderColor: cardBg,
              boxShadow: '0 4px 14px rgba(25,118,210,0.3)', mt: -5
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box pb={0.5}>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>{user?.username}</Typography>
              <Typography variant="body2" color="primary" fontWeight={500}>@{user?.username}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2} textAlign="center">
            {[
              { label: 'Posts', value: posts.length, color: 'text.primary' },
              { label: 'Likes', value: totalLikes, color: '#e53935' },
              { label: 'Comments', value: totalComments, color: '#1976d2' },
            ].map(({ label, value, color }) => (
              <Grid item xs={4} key={label}>
                <Paper elevation={0} sx={{ bgcolor: isDark ? '#2a2a2a' : '#f5f7fa', borderRadius: 3, py: 1.5 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color }}>{value}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Posts Header */}
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <GridViewIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700}>My Posts</Typography>
          <Chip label={posts.length} size="small" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, height: 20, fontSize: 11 }} />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : posts.length === 0 ? (
          <Box textAlign="center" mt={6} p={4}>
            <Typography variant="h2">📝</Typography>
            <Typography color="text.secondary" mt={1} fontWeight={500}>No posts yet</Typography>
            <Typography variant="body2" color="text.secondary">Share something with the community!</Typography>
          </Box>
        ) : (
          posts.map(post => (
            <Paper key={post._id} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, p: 2, mb: 1.5, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } }}>
              {post.text && <Typography variant="body2" sx={{ lineHeight: 1.6, mb: post.imageUrl ? 1 : 0 }}>{post.text}</Typography>}
              {post.imageUrl && <Box><img src={post.imageUrl} alt="post" style={{ width: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} /></Box>}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <FavoriteIcon sx={{ fontSize: 15, color: '#e53935' }} />
                  <Typography variant="caption" fontWeight={600}>{post.likes?.length || 0} likes</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 15, color: '#1976d2' }} />
                  <Typography variant="caption" fontWeight={600}>{post.comments?.length || 0} comments</Typography>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Container>
    </Box>
  );
}
