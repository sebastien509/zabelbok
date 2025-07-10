import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api'; // ✅ Ensure this is here

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 👈 new state

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false); // 👈 always call this after trying restore
  }, []);

  const login = async (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const res = await api.get('/auth/me');
    const fullUser = { ...res.data, token, role };
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
  
}
