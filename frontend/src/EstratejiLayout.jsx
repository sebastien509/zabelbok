// ✅ EstratejiLayout.jsx
import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import NetworkStatus from '@/components/system/NetworkStatus';
import GlobalBackgroundSync from '@/components/system/GlobalBackgroundSync';
import PWAInstallPrompt from '@/PWAInstallPrompt';

// E-strateji Pages
import DualLandingPage from '@/components2/pages/DualLandingPage';
import LandingPageE from '@/components2/pages/LandingPage';
import CreatorSignUp from '@/components2/pages/CreatorSignUp';
import Login from '@/components2/pages/Login';
import LearnerSignUp from '@/components2/pages/LearnerSignUp';
import CreatorDashboard from '@/components2/pages/CreatorDashboard';
import CreatorPage from '@/components2/pages/CreatorPage';
import LearnerDashboard from '@/components2/pages/LearnerDashboard';
import LearnerCourse from '@/components2/pages/LearnerCourse';
import ModuleViewer from '@/learner/ModuleViewer';

export default function EstratejiLayout() {
  const { user } = useAuth();
  const allowedRoles = ['creator', 'learner'];
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div>
      <NetworkStatus />
      <GlobalBackgroundSync />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPageE />} />
        <Route path="/dual" element={<DualLandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/creator" element={<CreatorSignUp />} />
        <Route path="/signup/learner" element={<LearnerSignUp />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/:id" element={<CreatorPage />} />
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/courses/:id" element={<LearnerCourse />} />
        <Route path="/modules/:id" element={<ModuleViewer />} />
      </Routes>
    </div>
  );
}
