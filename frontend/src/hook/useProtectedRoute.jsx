// src/hooks/useProtectedRoute.jsx (Reusable Route Guard)

import { Navigate } from 'react-router-dom';
import useUser from './useUser';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null; // or a loader/spinner

  if (!user) return <Navigate to="/login" />;

  return children;
}
