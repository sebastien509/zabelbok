import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingScreen from '@/components2/ui/LoadingScreen';

export default function RedirectIfLoggedIn({ allowedRoles = [], children }) {
  const { user, isLoading } = useAuth(); // 👈 include isLoading

  // 🔁 While checking session
  if (isLoading) return <LoadingScreen />;

  // 🟢 No user — allow access to children (e.g., login page)
  if (!user) return children;

  // 🎯 Adjust role for E-strateji users
  const adjustedRole = user?.school_id === 1
    ? user.role === 'professor'
      ? 'creator'
      : user.role === 'student'
        ? 'learner'
        : user.role
    : user.role;

  // ❌ Role mismatch? block access
  if (allowedRoles.length > 0 && !allowedRoles.includes(adjustedRole)) {
    return <Navigate to="/" />;
  }

  // ✅ Redirect to correct dashboard
  switch (adjustedRole) {
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'professor':
      return <Navigate to="/dashboard/professor" />;
    case 'student':
      return <Navigate to="/dashboard/student" />;
    case 'creator':
      return <Navigate to="/creator/dashboard" />;
    case 'learner':
      return <Navigate to="/learner/dashboard" />;
    default:
      return <Navigate to="/" />;
  }
}
