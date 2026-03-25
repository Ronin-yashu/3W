/**
 * @file Feed.jsx
 * @description Main feed page — shows paginated posts with infinite scroll,
 * create-post box, filter tabs, search, and notifications.
 */
import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Container, Tabs, Tab, Fab,
  BottomNavigation, BottomNavigationAction, InputAdornment, IconButton,
  Paper, Snackbar, Alert, Badge, useMediaQuery, useTheme, Button, TextField
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useNotifications } from '../hooks/useNotifications';
import PostCard from '../components/PostCard';
import CreatePostBox from '../components/CreatePostBox';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import NotificationDrawer from '../components/NotificationDrawer';
import EmptyState from '../components/EmptyState';

/** Feed filter tab labels */
const FILTERS = ['All Posts', 'Most Liked', 'Most Commented'];

export default function Feed({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Post state via custom hook
  const { posts, loading, loadingMore, hasMore, fetchPosts, loadMore, updatePost, prependPost } = usePosts();

  // Derived notifications via custom hook
  const notifications = useNotifications(posts, user?.username);

  // UI state
  const [tab, setTab] = useState(0);
  const [bottomNav, setBottomNav] = useState(0);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // Fetch posts on mount
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  /** Handles successful post creation from CreatePostBox */
  const handlePostCreated = (newPost) => {
    prependPost(newPost);
    setSnack({ open: true, msg: 'Posted! 🎉', severity: 'success' });
  };

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  /**
   * Client-side filtering and sorting.
   * Search filters by username/text; tabs sort by likes or comments.
   */
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.username?.toLowerCase().includes(q) ||
        p.text?.toLowerCase().includes(q)
      );
    }
    if (tab === 1) result.sort((a, b) => b.likes.length - a.likes.length);
    if (tab === 2) result.sort((a, b) => b.comments.length - a.comments.length);
    return result;
  }, [posts, tab, search]);

  const bg = darkMode ? '#121212' : '#f5f7fa';
  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';

  return (
    <Box bgcolor={bg} minHeight="100vh" pb={isMobile ? 8 : 4}>
      {/* ───── AppBar ───── */}
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: cardBg, borderBottom: '1px solid', borderColor: border }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2 }, minHeight: { xs: 56, sm: 64 } }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1976d2', fontSize: { xs: 18, sm: 20 } }}>
            Social
          </Typography>
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
            {/* Desktop search */}
            {!isMobile && (
              <TextField placeholder="Search posts, users..." size="small" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ width: { sm: 160, md: 220 }, '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 13 } }}
                InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon sx={{ color: '#1976d2' }} fontSize="small" /></InputAdornment> }}
              />
            )}
            {/* Mobile search icon */}
            {isMobile && (
              <IconButton size="small" onClick={() => setSearchOpen(true)} sx={{ color: darkMode ? '#fff' : '#555' }}>
                <SearchIcon />
              </IconButton>
            )}
            {/* Dark mode toggle */}
            <IconButton size="small" onClick={() => setDarkMode(!darkMode)}>
              {darkMode
                ? <LightModeOutlinedIcon sx={{ color: '#ffd54f', fontSize: 22 }} />
                : <DarkModeOutlinedIcon sx={{ color: '#555', fontSize: 22 }} />}
            </IconButton>
            {/* Bell — desktop only */}
            {!isMobile && (
              <IconButton size="small" onClick={() => setNotifOpen(true)}>
                <Badge badgeContent={notifications.length} color="error" max={9}>
                  <NotificationsNoneIcon sx={{ color: darkMode ? '#fff' : '#555' }} />
                </Badge>
              </IconButton>
            )}
            {/* Avatar */}
            <Box
              component="button"
              onClick={() => navigate('/profile')}
              sx={{
                width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 },
                borderRadius: '50%', bgcolor: '#1976d2', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 800,
                fontSize: { xs: 13, sm: 15 }, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Box>
          </Box>
        </Toolbar>

        {/* Mobile expandable search bar */}
        {isMobile && searchOpen && (
          <Box px={2} pb={1.5} sx={{ bgcolor: cardBg }}>
            <TextField autoFocus placeholder="Search posts, users..." fullWidth size="small"
              value={search} onChange={e => setSearch(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, fontSize: 14 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchOpen(false); setSearch(''); }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}
      </AppBar>

      {/* ───── Notification Drawer ───── */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        darkMode={darkMode}
      />

      {/* ───── Main Content ───── */}
      <Container maxWidth="sm" sx={{ pt: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
        {/* Create Post */}
        <CreatePostBox onPost={handlePostCreated} darkMode={darkMode} />

        {/* Filter Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{ minHeight: { xs: 40, sm: 44 }, px: 0.5 }}>
            {FILTERS.map((f, i) => (
              <Tab key={f} label={f} sx={{
                minHeight: { xs: 40, sm: 44 }, fontSize: { xs: 11, sm: 13 },
                fontWeight: 600, borderRadius: 5, mx: 0.3, px: { xs: 1.5, sm: 2 },
                color: tab === i ? '#fff !important' : (darkMode ? '#aaa' : '#888'),
                bgcolor: tab === i ? '#1976d2' : 'transparent',
                transition: 'all 0.2s', minWidth: 'unset'
              }} />
            ))}
          </Tabs>
        </Paper>

        {/* Posts list */}
        {loading ? (
          // Skeleton-style loading cards
          Array.from({ length: 3 }).map((_, i) => (
            <Paper key={i} elevation={0} sx={{
              borderRadius: 3, border: '1px solid', borderColor: border,
              bgcolor: cardBg, p: 2, mb: 2, height: 120,
              background: darkMode
                ? 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)'
                : 'linear-gradient(90deg, #f5f7fa 25%, #e8eaf0 50%, #f5f7fa 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              '@keyframes shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }
            }} />
          ))
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            emoji={search ? '🔍' : '📭'}
            title={search ? `No results for "${search}"` : 'No posts yet'}
            subtitle={search ? 'Try a different search term' : 'Be the first to post something!'}
          />
        ) : (
          <>
            {filteredPosts.map(post =>
              <PostCard key={post._id} post={post} onUpdate={updatePost} darkMode={darkMode} />
            )}
            {/* Infinite scroll trigger — only when not searching/sorting */}
            {tab === 0 && !search && (
              <InfiniteScrollTrigger
                onIntersect={loadMore}
                hasMore={hasMore}
                loading={loadingMore}
              />
            )}
          </>
        )}
      </Container>

      {/* ───── FAB ───── */}
      <Fab color="primary"
        sx={{ position: 'fixed', bottom: { xs: 72, sm: 24 }, right: { xs: 16, sm: 24 }, boxShadow: '0 4px 16px rgba(25,118,210,0.4)' }}
        onClick={() => navigate('/create')}>
        <AddIcon />
      </Fab>

      {/* ───── Mobile Bottom Nav ───── */}
      {isMobile && (
        <Paper elevation={4} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}>
          <BottomNavigation value={bottomNav} sx={{ bgcolor: '#1976d2', height: 60 }}>
            <BottomNavigationAction icon={<HomeIcon />}
              onClick={() => { setBottomNav(0); navigate('/'); }}
              sx={{ color: '#fff !important', opacity: bottomNav === 0 ? 1 : 0.6, minWidth: 0 }} />
            <BottomNavigationAction
              icon={<Badge badgeContent={notifications.length} color="error" max={9}><NotificationsNoneIcon /></Badge>}
              onClick={() => { setBottomNav(1); setNotifOpen(true); }}
              sx={{ color: '#fff !important', opacity: bottomNav === 1 ? 1 : 0.6, minWidth: 0 }} />
            <BottomNavigationAction icon={<AccountCircleIcon />}
              onClick={() => { setBottomNav(2); navigate('/profile'); }}
              sx={{ color: '#fff !important', opacity: bottomNav === 2 ? 1 : 0.6, minWidth: 0 }} />
            <BottomNavigationAction icon={<LogoutIcon />} onClick={handleLogout}
              sx={{ color: '#fff !important', opacity: 0.7, minWidth: 0 }} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Desktop logout */}
      {!isMobile && (
        <Box sx={{ position: 'fixed', bottom: 24, left: 24 }}>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout} size="small"
            sx={{ borderRadius: 5, fontWeight: 600, borderColor: border, color: 'text.secondary', '&:hover': { borderColor: '#e53935', color: '#e53935' } }}>
            Logout
          </Button>
        </Box>
      )}

      {/* Toast */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
