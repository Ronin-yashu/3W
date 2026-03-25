import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Container, CircularProgress,
  Avatar, TextField, Button, Tabs, Tab, Fab, BottomNavigation,
  BottomNavigationAction, InputAdornment, IconButton, Paper, Divider,
  Snackbar, Alert, Badge, Drawer, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/api/posts');
      setPosts(data);
      // Build notifications from likes/comments on user's posts
      const myPosts = data.filter(p => p.username === user?.username);
      const notifs = [];
      myPosts.forEach(post => {
        post.likes?.forEach(l => {
          if (l.username !== user?.username)
            notifs.push({ type: 'like', from: l.username, text: post.text || 'your post', postId: post._id });
        });
        post.comments?.forEach(c => {
          if (c.username !== user?.username)
            notifs.push({ type: 'comment', from: c.username, text: c.text, postId: post._id });
        });
      });
      setNotifications(notifs.reverse());
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
      setSnack({ open: true, msg: 'Post created! 🎉', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to post', severity: 'error' });
    } finally { setPosting(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

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
              placeholder="Search posts, users..."
              size="small" value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ width: 190, '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 13 }, display: { xs: 'none', sm: 'flex' } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon sx={{ color: '#1976d2' }} fontSize="small" /></InputAdornment> }}
            />
            <IconButton size="small" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightModeOutlinedIcon sx={{ color: '#ffd54f' }} /> : <DarkModeOutlinedIcon sx={{ color: '#555' }} />}
            </IconButton>
            <IconButton size="small" onClick={() => setNotifOpen(true)}>
              <Badge badgeContent={notifications.length} color="error" max={9}>
                <NotificationsNoneIcon sx={{ color: darkMode ? '#fff' : '#555' }} />
              </Badge>
            </IconButton>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', cursor: 'pointer', fontSize: 14 }}
              onClick={() => navigate('/profile')}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer */}
      <Drawer anchor="right" open={notifOpen} onClose={() => setNotifOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: darkMode ? '#1e1e1e' : '#fff' } }}>
        <Box p={2} borderBottom="1px solid" sx={{ borderColor: darkMode ? '#333' : '#e8eaf0' }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box textAlign="center" mt={6}>
            <Typography variant="h3">🔔</Typography>
            <Typography color="text.secondary" mt={1}>No notifications yet</Typography>
          </Box>
        ) : (
          <List dense>
            {notifications.map((n, i) => (
              <ListItem key={i} divider onClick={() => setNotifOpen(false)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5' } }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: n.type === 'like' ? '#e53935' : '#1976d2', width: 36, height: 36, fontSize: 13 }}>
                    {n.type === 'like' ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>@{n.from} {n.type === 'like' ? 'liked' : 'commented on'} your post</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary" noWrap>{n.text}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      <Container maxWidth="sm" sx={{ pt: 2 }}>
        {/* Create Post */}
        <Paper elevation={0} sx={{
          borderRadius: 3, border: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0',
          bgcolor: darkMode ? '#1e1e1e' : '#fff', mb: 2, overflow: 'hidden'
        }}>
          <Box p={2}>
            <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Create Post</Typography>
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
            <IconButton component="label" size="small" sx={{ color: '#1976d2' }}>
              <ImageOutlinedIcon />
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </IconButton>
            <Button variant="contained" size="small" endIcon={<SendIcon />}
              onClick={handleQuickPost}
              disabled={posting || (!quickText.trim() && !image)}
              sx={{ borderRadius: 5, px: 3, fontWeight: 600 }}>
              {posting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Paper>

        {/* Filter Tabs */}
        <Paper elevation={0} sx={{
          borderRadius: 3, border: '1px solid', borderColor: darkMode ? '#333' : '#e8eaf0',
          bgcolor: darkMode ? '#1e1e1e' : '#fff', mb: 2
        }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{ minHeight: 44, px: 1 }}>
            {FILTERS.map((f, i) => (
              <Tab key={f} label={f} sx={{
                minHeight: 44, fontSize: 13, fontWeight: 600, borderRadius: 5, mx: 0.5, px: 2,
                color: tab === i ? '#fff !important' : (darkMode ? '#aaa' : '#888'),
                bgcolor: tab === i ? '#1976d2' : 'transparent',
                transition: 'all 0.2s'
              }} />
            ))}
          </Tabs>
        </Paper>

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
          <BottomNavigationAction icon={<HomeIcon />} onClick={() => { setBottomNav(0); navigate('/'); }}
            sx={{ color: '#fff !important', opacity: bottomNav === 0 ? 1 : 0.6 }} />
          <BottomNavigationAction
            icon={
              <Badge badgeContent={notifications.length} color="error" max={9}>
                <NotificationsNoneIcon />
              </Badge>
            }
            onClick={() => { setBottomNav(1); setNotifOpen(true); }}
            sx={{ color: '#fff !important', opacity: bottomNav === 1 ? 1 : 0.6 }} />
          <BottomNavigationAction icon={<AccountCircleIcon />}
            onClick={() => { setBottomNav(2); navigate('/profile'); }}
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
