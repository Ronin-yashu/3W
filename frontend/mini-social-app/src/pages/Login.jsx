import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 360, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={1} textAlign="center">Welcome Back</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>Login to your account</Typography>
        {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField label="Email" type="email" fullWidth required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} sx={{ mb: 3 }} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2 }}>Login</Button>
        </form>
        <Typography variant="body2" textAlign="center" mt={2}>
          Don't have an account?{' '}<Link component={RouterLink} to="/signup">Sign up</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
