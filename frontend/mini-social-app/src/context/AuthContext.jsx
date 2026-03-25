import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, verify cookie with backend
  useEffect(() => {
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (data) => setUser(data);

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  const isAuthenticated = !!user;

  if (loading) return null; // wait for cookie verification

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
