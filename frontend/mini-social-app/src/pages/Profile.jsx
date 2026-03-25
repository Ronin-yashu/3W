/**
 * Profile.jsx — own posts list, followers/following counts, bio edit.
 */
import { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Paper, AppBar, Toolbar,
  Divider, useTheme, useMediaQuery, Skeleton, IconButton, TextField
} from '@mui/material';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon        from '@mui/icons-material/Check';
import CloseIcon        from '@mui/icons-material/Close';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../context/AuthContext';
import api              from '../api/axios';
import PostCard         from '../components/PostCard';

export default function Profile({ darkMode }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('sm'));

  const [profile, setProfile]       = useState(null);
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio]               = useState('');
  const [savingBio, setSavingBio]   = useState(false);

  const bg     = darkMode ? '#121212' : '#f5f7fa';
  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/users/${user.username}`);
        setProfile(data.user);
        setPosts(data.posts);
        setBio(data.user.bio || '');
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user?.username) load();
  }, [user]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const { data } = await api.patch('/api/users/me/bio', { bio });
      setProfile(p => ({ ...p, bio: data.bio }));
      setEditingBio(false);
    } finally { setSavingBio(false); }
  };

  const updatePost = (p)  => setPosts(prev => prev.map(x => x._id === p._id ? p : x));
  const deletePost = (id) => setPosts(prev => prev.filter(p => p._id !== id));

  if (loading) return (
    <Box bgcolor={bg} minHeight="100vh">
      <Box sx={{ maxWidth: 600, mx: 'auto', pt: 4, px: 2 }}>
        {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />)}
      </Box>
    </Box>
  );

  return (
    <Box bgcolor={bg} minHeight="100vh" pb={4}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: cardBg, borderBottom: '1px solid', borderColor: border }}>
        <Toolbar sx={{ px: { xs: 1.5, sm: 2 }, minHeight: { xs: 56, sm: 64 } }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
          <Typography fontWeight={700} fontSize={17}>Profile</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: { xs: 1.5, sm: 2 }, pt: 3 }}>
        {/* Profile card */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, p: { xs: 2.5, sm: 3 }, mb: 2 }}>
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Avatar sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, bgcolor: '#1976d2', fontSize: { xs: 26, sm: 32 }, fontWeight: 800, boxShadow: '0 4px 16px rgba(25,118,210,0.3)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight={800} fontSize={{ xs: 17, sm: 20 }}>{user?.username}</Typography>
              <Typography variant="body2" color="primary" fontWeight={600} mb={0.5}>@{user?.username}</Typography>
              {editingBio ? (
                <Box>
                  <TextField fullWidth multiline minRows={2} maxRows={4} size="small"
                    value={bio} onChange={e => setBio(e.target.value.slice(0, 160))}
                    placeholder="Write a bio..."
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: 2 } }}
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">{160 - bio.length} chars left</Typography>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => setEditingBio(false)}><CloseIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={handleSaveBio} disabled={savingBio} sx={{ color: '#1976d2' }}><CheckIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2" color={bio ? (darkMode ? '#ccc' : '#444') : 'text.secondary'} fontStyle={bio ? 'normal' : 'italic'} fontSize={13}>
                    {bio || 'No bio yet — tap ✏️ to add one'}
                  </Typography>
                  <IconButton size="small" onClick={() => setEditingBio(true)} sx={{ color: '#aaa', '&:hover': { color: '#1976d2' } }}>
                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: border, mb: 2 }} />
          <Box display="flex" justifyContent="space-around">
            {[
              { label: 'Posts',     value: posts.length },
              { label: 'Followers', value: profile?.followers?.length ?? 0 },
              { label: 'Following', value: profile?.following?.length ?? 0 },
            ].map(({ label, value }) => (
              <Box key={label} textAlign="center">
                <Typography fontWeight={800} fontSize={{ xs: 18, sm: 22 }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {posts.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography fontSize={40}>📭</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>No posts yet</Typography>
          </Box>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onUpdate={updatePost} onDelete={deletePost} darkMode={darkMode} />
          ))
        )}
      </Box>
    </Box>
  );
}
