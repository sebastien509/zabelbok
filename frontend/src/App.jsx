import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import NetworkStatus from './components/system/NetworkStatus';
import PWAInstallPrompt from './PWAInstallPrompt';
import GlobalBackgroundSync from './components/system/GlobalBackgroundSync';
import { syncCompletedModules } from '@/components2/moduleSync';

import Sidebar from './components/system/Sidebar';
import i18n from 'i18next';

import RedirectIfLoggedIn from './components/auth/RedirectIfLoggedIn';
import ProtectedRoute from './components/auth/ProtectedRoute';


// Dashboards
import AdminDashboard from './components/dashboards/AdminDashboard';
import ProfessorDashboard from './components/dashboards/ProfessorDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';

// Auth
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import LandingPage from './components/auth/LandingPage';

// Shared Routes

import OfflineLibraryViewer from './components/offline/viewers/OfflineLibraryViewer';
import NotificationPage from './components/notification/NotificationPage';




// Admin
import ManageSchools from './routes/admin/ManageSchools';
import ManageUsers from './routes/admin/ManageUsers';
import CoursesOverview from './routes/admin/CoursesOverview';
import BooksViewOnly from './routes/admin/BooksViewOnly';
import LecturesViewOnly from './routes/admin/LecturesViewOnly';
import ExercisesAndQuizzesViewOnly from './routes/admin/ExercisesAndQuizzesViewOnly';
import StudentAnalytics from './routes/admin/StudentAnalytics';
import AdminSettings from './routes/admin/AdminSettings';

// Professor
import MyCourses from './routes/professor/MyCourses';
import CourseDetails from './routes/professor/CourseDetails';
import MyStudents from './routes/professor/MyStudents';
import ManageBookChapters from './routes/professor/ManageBookChapters';
import ManageLectures from './routes/professor/ManageLectures';
import ProfessorExercises from './routes/professor/ProfessorExercises';
import ProfessorQuizzes from './routes/professor/ProfessorQuizzes';
import ProfessorTracking from './routes/professor/ProfessorTracking';
import ProfessorOfflineContent from './routes/professor/ProfessorOfflineContent';
import CourseAnalytics from './routes/professor/CourseAnalytics';
import ProfessorSettings from './routes/professor/ProfessorSettings';

// Student
import StudentCourses from './routes/student/StudentCourses';
import StudentBooks from './routes/student/StudentBooks';
import StudentLectures from './routes/student/StudentLectures';
import StudentExercises from './routes/student/StudentExercises';
import ProgressTracker from './routes/student/ProgressTracker';
import StudentOfflineContent from './routes/student/StudentOfflineContent';
import StudentSettings from './routes/student/StudentSettings';
import ProfessorMessageDashboard from './routes/professor/ProfessorMessageDashboard';
import StudentCourseDetails from '@/routes/student/StudentCourseDetails'
import QuizBoard from './routes/student/QuizBoard';
import StudentMessageDashboard from './routes/student/StudentMessageDashboard';
import RoleBasedOfflinePage from './components/system/RoleBasedOfflinePage';


import DualLandingPage from './components2/pages/DualLandingPage';

// E-strateji (Creator / Learner) imports
import CreatorDashboard from './components2/pages/CreatorDashboard';
import LearnerDashboard from './components2/pages/LearnerDashboard';
import CreatorPage from './components2/pages/CreatorPage';
import ModuleViewer from './learner/ModuleViewer';
import LandingPageE from './components2/pages/LandingPage';
import CreatorSignUp from './components2/pages/CreatorSignUp';
import Login from './components2/pages/Login';
import LearnerSignUp from './components2/pages/LearnerSignUp';
import LearnerCourse from './components2/pages/LearnerCourse';

// Public creator page (safe data, themed)
import PublicCreatorPage from './components2/pages/PublicCreatorPage'
// Creator onboarding wizard (6 steps)
import CreatorOnboarding from './components2/onboarding/CreatorOnboarding'
import { needsCreatorOnboarding } from './utils/onboarding';

import { useAuth } from '@/components/auth/AuthProvider'; // adjust path


export default function App() {

  const { user, isLoading } = useAuth(); // 👈 include isLoading
// 🔁 Dynamically override role based on school_id
const adjustedRole = user?.school_id === 1
  ? user.role === 'professor'
    ? 'creator'
    : user.role === 'student'
      ? 'learner'
      : user.role
  : user?.role;
  const token = user?.token;

  useEffect(() => {
    if (!user) return;
  
    const preferredLanguage = user?.language || localStorage.getItem('i18nextLng') || 'fr';
i18n.changeLanguage(preferredLanguage);
  
    i18n.changeLanguage(preferredLanguage);
    console.log('✅ Language loaded from user:', preferredLanguage);
  
    window.addEventListener('online', syncCompletedModules);
    return () => window.removeEventListener('online', syncCompletedModules);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }
  const AmaiderLayoutWrapper = ({ children }) => (
    <div className="flex h-screen overflow-hidden">
      {user && <Sidebar />}
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
  
  

  return (
    <>
      <NetworkStatus />
      {/* <GlobalBackgroundSync /> */}
      <PWAInstallPrompt />
     
          <Routes>

            {/* Public routes */}
            <Route path="/dual" element={ 
               <RedirectIfLoggedIn>
                <DualLandingPage />  
                </RedirectIfLoggedIn>
              } />

            <Route path="/" element={<LandingPageE/>}/>

            {/* <Route path="/amaider/login" element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          } /> */}

            <Route path="/:slug" element={<PublicCreatorPage />} />

            {/* Amaider Auth */}
            <Route path="/amaider/login" element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          } />            
          
            <Route path="/register" element={
            <RedirectIfLoggedIn>
              <RegisterPage />
            </RedirectIfLoggedIn>
          } />


            {/* E-strateji Auth */}
            <Route path="/login" element={
            <RedirectIfLoggedIn>
              <Login />
            </RedirectIfLoggedIn>
          } />           
          
          <Route path="/signup/creator" element={
          <RedirectIfLoggedIn>
            <CreatorSignUp />
          </RedirectIfLoggedIn>
        } />

          <Route path="/signup/learner" element={
            <RedirectIfLoggedIn>
              <LearnerSignUp />
            </RedirectIfLoggedIn>
          } />

        <Route
          path="/creator/onboarding"
          element={
            <ProtectedRoute allowedRoles={['creator']}>
              <CreatorOnboarding />
            </ProtectedRoute>
          }
        />



            {/* E-strateji  Private */}

            {adjustedRole === 'creator' && (
            <Route path="/creator/*" element={<CreatorDashboard />} />
          )}

          {adjustedRole === 'learner' && (
          <Route path="/learner/*" element={<LearnerDashboard />} />
        )}
        


          <Route path="/creator/dashboard" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <CreatorDashboard />
        </ProtectedRoute>
      } />            
      {/* 🔵 E-strateji Public + Auth Pages */}
            {/* 🟢 Learner-Facing Course Pages */}
            <Route path="/learner/courses/:id" element={          <ProtectedRoute allowedRoles={['learner']}>
            <LearnerCourse />           
            </ProtectedRoute>
}  />

      
          <Route
            path="/creator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                {needsCreatorOnboarding(user)
                  ? <Navigate to="/creator/onboarding" replace />
                  : <CreatorDashboard />
                }
              </ProtectedRoute>
            }
          />
      

            <Route path="/modules/:id" element={<ModuleViewer />} />
     






{/* ALl other Amaider routes  */}
<Route element={
  <ProtectedRoute allowedRoles={['admin', 'professor', 'student']}>
    <AmaiderLayoutWrapper />
  </ProtectedRoute>
}>
  {/* Dashboards */}
  <Route path="/dashboard/admin" element={<AdminDashboard />} />
  <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
  <Route path="/dashboard/student" element={<StudentDashboard />} />

  {/* Admin only */}
  <Route path="/schools" element={<ManageSchools />} />
  <Route path="/users" element={<ManageUsers />} />
  <Route path="/courses" element={<CoursesOverview />} />
  <Route path="/books" element={<BooksViewOnly />} />
  <Route path="/lectures" element={<LecturesViewOnly />} />
  <Route path="/quizzes" element={<ExercisesAndQuizzesViewOnly />} />
  <Route path="/analytics" element={<StudentAnalytics />} />
  <Route path="/settings" element={<AdminSettings />} />

  {/* Professor only */}
  <Route path="/my-courses" element={<MyCourses />} />
  <Route path="/courses/:id" element={<CourseDetails />} />
  <Route path="/students" element={<MyStudents />} />
  <Route path="/books/manage" element={<ManageBookChapters />} />
  <Route path="/lectures/manage" element={<ManageLectures />} />
  <Route path="/exercises" element={<ProfessorExercises />} />
  <Route path="/quizzes/manage" element={<ProfessorQuizzes />} />
  <Route path="/tracking" element={<ProfessorTracking />} />
  <Route path="/analytics/professor" element={<CourseAnalytics />} />
  <Route path="/settings/professor" element={<ProfessorSettings />} />
  <Route path="/professor/message" element={<ProfessorMessageDashboard />} />
  <Route path="/offline/professor" element={<RoleBasedOfflinePage />} />

  {/* Student only */}
  <Route path="/student/my-courses" element={<StudentCourses />} />
  <Route path="/books/read" element={<StudentBooks />} />
  <Route path="/lectures/content" element={<StudentLectures />} />
  <Route path="/exercise/:id" element={<StudentExercises />} />
  <Route path="/quiz/:id" element={<QuizBoard />} />
  <Route path="/exercises/solve" element={<StudentExercises />} />
  <Route path="/student/Quiz" element={<QuizBoard />} />
  <Route path="/progress" element={<ProgressTracker />} />
  <Route path="/settings/student" element={<StudentSettings />} />
  <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
  <Route path="/student/message" element={<StudentMessageDashboard />} />
  <Route path="/offline/student" element={<RoleBasedOfflinePage />} />

  {/* Shared */}
  <Route path="/notifications" element={<NotificationPage />} />
</Route>

          

          {/* {!adjustedRole && <Route path="*" element={<Navigate to="/" />} />} */}

<Route path="*" element={
  user ? (
    <Navigate to={
      adjustedRole === 'admin' ? '/dashboard/admin'
      : adjustedRole === 'professor' ? '/dashboard/professor'
      : adjustedRole === 'student' ? '/dashboard/student'
      : adjustedRole === 'creator' ? '/creator/dashboard'
      : adjustedRole === 'learner' ? '/learner/dashboard'
      : '/dual'
    } />
  ) : <Navigate to="/" />
} />

          </Routes>
    </>
  );
}
