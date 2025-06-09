// ✅ useUser.js (Simple Auth Hook)
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);

    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
