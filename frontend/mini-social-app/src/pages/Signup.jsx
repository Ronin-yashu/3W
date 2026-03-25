import { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper,
  InputAdornment, IconButton, Alert, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/signup', form);
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally { setLoading(false); }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
      <Box sx={{
        flex: { md: 1 },
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, #1565c0 0%, #1976d2 55%, #42a5f5 100%)',
        p: { xs: 4, md: 6 },
        minHeight: { xs: 200, md: 'unset' },
        color: '#fff'
      }}>
        <Typography variant="h2" fontWeight={800} mb={1} sx={{ fontSize: { xs: 40, md: 56 } }}>📣</Typography>
        <Typography variant="h4" fontWeight={800} mb={1.5} sx={{ fontSize: { xs: 26, md: 36 } }}>Join Today</Typography>
        <Typography variant="body1" textAlign="center" sx={{ opacity: 0.85, maxWidth: 300, fontSize: { xs: 13, md: 16 } }}>
          Create your account and start sharing.
        </Typography>
        <Box mt={3} display="flex" gap={1} flexWrap="wrap" justifyContent="center">
          {['Free Forever', 'Secure Auth', 'Mobile Ready', 'Real-time'].map(f => (
            <Box key={f} sx={{ bgcolor: 'rgba(255,255,255,0.18)', px: 1.5, py: 0.5, borderRadius: 5, fontSize: { xs: 11, md: 13 }, fontWeight: 600 }}>{f}</Box>
          ))}
        </Box>
      </Box>

      <Box flex={1} display="flex" alignItems="center" justifyContent="center"
        bgcolor="#f5f7fa" p={{ xs: 2, sm: 3 }}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4, md: 5 },
          width: '100%', maxWidth: { xs: '100%', sm: 420 },
          borderRadius: { xs: 3, sm: 4 },
          border: '1px solid #e8eaf0'
        }}>
          <Box mb={3}>
            <Typography variant="h5" fontWeight={800} color="primary" fontSize={{ xs: 20, sm: 24 }}>Create Account 🚀</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Fill in your details to get started</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>USERNAME</Typography>
            <TextField fullWidth required placeholder="e.g. yashu_jaat01"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#1976d2', fontSize: 18 }} /></InputAdornment> }}
              sx={{ mt: 0.5, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>EMAIL ADDRESS</Typography>
            <TextField type="email" fullWidth required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#1976d2', fontSize: 18 }} /></InputAdornment> }}
              sx={{ mt: 0.5, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>PASSWORD</Typography>
            <TextField type={showPass ? 'text' : 'password'} fullWidth required placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1976d2', fontSize: 18 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)} size="small" edge="end">{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>
              }}
              sx={{ mt: 0.5, mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              sx={{ borderRadius: 2, py: 1.4, fontWeight: 700, fontSize: { xs: 14, sm: 15 }, textTransform: 'none', boxShadow: '0 4px 14px rgba(25,118,210,0.35)' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
          <Divider sx={{ my: 2.5 }}><Typography variant="caption" color="text.secondary">Have an account?</Typography></Divider>
          <Button component={RouterLink} to="/login" variant="outlined" fullWidth size="large"
            sx={{ borderRadius: 2, py: 1.3, fontWeight: 600, textTransform: 'none', fontSize: { xs: 13, sm: 14 } }}>
            Sign in instead
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
