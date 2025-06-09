// src/components/system/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useUser from '@/hooks/useUser';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) return null; // optionally a spinner

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}