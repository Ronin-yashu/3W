import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/auth/signup', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 360, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={1} textAlign="center">Create Account</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>Join the community</Typography>
        {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField label="Username" fullWidth required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Email" type="email" fullWidth required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} sx={{ mb: 3 }} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2 }}>Sign Up</Button>
        </form>
        <Typography variant="body2" textAlign="center" mt={2}>
          Already have an account?{' '}<Link component={RouterLink} to="/login">Login</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
