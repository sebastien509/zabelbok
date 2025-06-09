import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) setUser({ token, role });
  }, []);

  const login = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(userInfo)); // 👈 Add this
    setUser({ token, role, ...userInfo });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.setItem('user', JSON.stringify(userInfo)); 

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
