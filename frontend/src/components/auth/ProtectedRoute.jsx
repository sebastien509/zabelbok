import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import LoadingScreen from '@/components2/ui/LoadingScreen';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  const adjustedRole = user?.school_id === 1
    ? user.role === 'professor'
      ? 'creator'
      : user.role === 'student'
        ? 'learner'
        : user.role
    : user?.role;

  useEffect(() => {
    if (user && !allowedRoles.includes(adjustedRole)) {
      setRedirecting(true);
    }
  }, [user]);

  if (isLoading || redirecting) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(adjustedRole)) return <Navigate to="/unauthorized" />;

  return children;
}
