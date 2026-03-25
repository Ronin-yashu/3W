import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Container, CircularProgress,
  Avatar, TextField, Button, Tabs, Tab, Fab, BottomNavigation,
  BottomNavigationAction, InputAdornment, IconButton, Paper, Divider, Snackbar, Alert
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

const FILTERS = ['All Post', 'Most Liked', 'Most Commented'];

export default function Feed({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [bottomNav, setBottomNav] = useState(0);
  const [quickText, setQuickText] = useState('');
  const [posting, setPosting] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/api/posts');
      setPosts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleQuickPost = async () => {
    if (!quickText.trim() && !image) return;
    setPosting(true);
    try {
      const formData = new FormData();
      if (quickText.trim()) formData.append('text', quickText);
      if (image) formData.append('image', image);
      const { data } = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts(prev => [data, ...prev]);
      setQuickText(''); setImage(null); setPreview(null);
      setSnack({ open: true, msg: 'Post created!', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to post', severity: 'error' });
    } finally { setPosting(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (search.trim()) {
      result = result.filter(p =>
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        p.text?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (tab === 1) result.sort((a, b) => b.likes.length - a.likes.length);
    if (tab === 2) result.sort((a, b) => b.comments.length - a.comments.length);
    return result;
  }, [posts, tab, search]);

  return (
    <Box bgcolor={darkMode ? '#121212' : '#f0f2f5'} minHeight="100vh" pb={8}>
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: darkMode ? '#1e1e1e' : '#fff', borderBottom: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1976d2' }}>Social</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              placeholder="Search promotions, users,"
              size="small" value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ width: 190, '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 13 }, display: { xs: 'none', sm: 'flex' } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon sx={{ color: '#1976d2' }} fontSize="small" /></InputAdornment> }}
            />
            <IconButton size="small" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightModeOutlinedIcon sx={{ color: '#ffd54f' }} /> : <DarkModeOutlinedIcon sx={{ color: '#555' }} />}
            </IconButton>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', cursor: 'pointer', fontSize: 14 }}
              onClick={() => navigate('/profile')}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 2 }}>
        {/* Create Post */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0', mb: 2, overflow: 'hidden' }}>
          <Box p={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>Create Post</Typography>
              <Box sx={{ bgcolor: darkMode ? '#333' : '#f0f2f5', borderRadius: 5, display: 'flex', overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#1976d2', color: '#fff', px: 2, py: 0.5, fontSize: 13, fontWeight: 600, borderRadius: 5 }}>All Posts</Box>
                <Box sx={{ color: '#888', px: 2, py: 0.5, fontSize: 13 }}>Promotions</Box>
              </Box>
            </Box>
            <TextField
              placeholder="What's on your mind?"
              multiline minRows={2} fullWidth
              value={quickText} onChange={e => setQuickText(e.target.value)}
              variant="standard" InputProps={{ disableUnderline: false }}
              sx={{ '& .MuiInput-root': { fontSize: 14 } }}
            />
            {preview && (
              <Box mt={1.5}>
                <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
                <Button size="small" color="error" onClick={() => { setImage(null); setPreview(null); }} sx={{ mt: 0.5 }}>Remove</Button>
              </Box>
            )}
          </Box>
          <Divider />
          <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1}>
            <Box display="flex" gap={1}>
              <IconButton component="label" size="small" sx={{ color: '#1976d2' }}>
                <ImageOutlinedIcon />
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#1976d2' }}><EmojiEmotionsOutlinedIcon /></IconButton>
            </Box>
            <Button variant="contained" size="small" endIcon={<SendIcon />}
              onClick={handleQuickPost}
              disabled={posting || (!quickText.trim() && !image)}
              sx={{ borderRadius: 5, px: 3, fontWeight: 600 }}>
              {posting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Paper>

        {/* Filter Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{ minHeight: 44, px: 1 }}>
            {FILTERS.map((f, i) => (
              <Tab key={f} label={f} sx={{
                minHeight: 44, fontSize: 13, fontWeight: 600, borderRadius: 5, mx: 0.5, px: 2,
                color: tab === i ? '#fff !important' : '#888',
                bgcolor: tab === i ? '#1976d2' : 'transparent',
                transition: 'all 0.2s'
              }} />
            ))}
          </Tabs>
        </Paper>

        {/* Posts */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
        ) : filteredPosts.length === 0 ? (
          <Box textAlign="center" mt={8}>
            <Typography variant="h2" mb={1}>{search ? '🔍' : '📭'}</Typography>
            <Typography variant="h6" fontWeight={600} color="text.secondary">
              {search ? `No results for "${search}"` : 'No posts yet'}
            </Typography>
          </Box>
        ) : (
          filteredPosts.map(post => <PostCard key={post._id} post={post} onUpdate={handleUpdate} darkMode={darkMode} />)
        )}
      </Container>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 72, right: 20, boxShadow: '0 4px 16px rgba(25,118,210,0.4)' }}
        onClick={() => navigate('/create')}>
        <AddIcon />
      </Fab>

      <Paper elevation={4} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation value={bottomNav} onChange={(_, v) => setBottomNav(v)} sx={{ bgcolor: '#1976d2' }}>
          <BottomNavigationAction icon={<HomeIcon />} onClick={() => navigate('/')}
            sx={{ color: '#fff !important', opacity: bottomNav === 0 ? 1 : 0.6 }} />
          <BottomNavigationAction icon={<NotificationsNoneIcon />}
            sx={{ color: '#fff !important', opacity: bottomNav === 1 ? 1 : 0.6 }} />
          <BottomNavigationAction icon={<AccountCircleIcon />} onClick={() => { setBottomNav(2); navigate('/profile'); }}
            sx={{ color: '#fff !important', opacity: bottomNav === 2 ? 1 : 0.6 }} />
          <BottomNavigationAction icon={<LogoutIcon />} onClick={handleLogout}
            sx={{ color: '#fff !important', opacity: 0.7 }} />
        </BottomNavigation>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
