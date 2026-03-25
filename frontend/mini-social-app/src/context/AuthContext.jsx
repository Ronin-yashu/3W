import { createContext, useContext, useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))  // 401 = not logged in, that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = (data) => setUser(data);

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setUser(null);
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
