// ✅ AuthContext.jsx (Global Auth + JWT Persistence)
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // ✅ ensure auth header
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false)); // ✅ only stop loading after finished
    } else {
      setLoading(false);
    }
  }, []);
  

  const login = (token) => {
    localStorage.setItem('token', token);
    api.get('/me').then(res => setUser(res.data));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
    {children}
  </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
