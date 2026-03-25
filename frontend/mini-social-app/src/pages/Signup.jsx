import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      setError(err.response?.data?.error || 'Signup failed. Try a different email.');
    } finally { setLoading(false); }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
      <Paper elevation={0} sx={{ p: 4, width: 380, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1976d2' }}>📣 SocialFeed</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Create your account</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Username" fullWidth required
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#1976d2' }} /></InputAdornment> }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField label="Email" type="email" fullWidth required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#1976d2' }} /></InputAdornment> }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1976d2' }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)} size="small">{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
            }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: 16 }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        <Typography variant="body2" textAlign="center" mt={2.5} color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: '#1976d2', fontWeight: 600 }}>Login</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
