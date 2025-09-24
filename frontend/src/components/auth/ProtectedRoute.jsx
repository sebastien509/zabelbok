import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import LoadingScreen from '@/components2/ui/LoadingScreen';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth();

  const adjustedRole = user?.school_id === 1
    ? user.role === 'professor'
      ? 'creator'
      : user.role === 'student'
        ? 'learner'
        : user.role
    : user?.role;

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(adjustedRole)) {
    return <Navigate to="/dual" replace />;
  }

  return children;
}
