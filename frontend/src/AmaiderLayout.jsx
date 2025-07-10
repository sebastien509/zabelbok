// ✅ AmaiderLayout.jsx
import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import Sidebar from '@/components/system/Sidebar';
import NetworkStatus from '@/components/system/NetworkStatus';
import GlobalBackgroundSync from '@/components/system/GlobalBackgroundSync';
import PWAInstallPrompt from '@/PWAInstallPrompt';

// Dashboards
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

// Admin Routes
import ManageSchools from '@/routes/admin/ManageSchools';
import ManageUsers from '@/routes/admin/ManageUsers';
import CoursesOverview from '@/routes/admin/CoursesOverview';
import BooksViewOnly from '@/routes/admin/BooksViewOnly';
import LecturesViewOnly from '@/routes/admin/LecturesViewOnly';
import ExercisesAndQuizzesViewOnly from '@/routes/admin/ExercisesAndQuizzesViewOnly';
import StudentAnalytics from '@/routes/admin/StudentAnalytics';
import AdminSettings from '@/routes/admin/AdminSettings';

// Professor Routes
import MyCourses from '@/routes/professor/MyCourses';
import CourseDetails from '@/routes/professor/CourseDetails';
import MyStudents from '@/routes/professor/MyStudents';
import ManageBookChapters from '@/routes/professor/ManageBookChapters';
import ManageLectures from '@/routes/professor/ManageLectures';
import ProfessorExercises from '@/routes/professor/ProfessorExercises';
import ProfessorQuizzes from '@/routes/professor/ProfessorQuizzes';
import ProfessorTracking from '@/routes/professor/ProfessorTracking';
import CourseAnalytics from '@/routes/professor/CourseAnalytics';
import ProfessorSettings from '@/routes/professor/ProfessorSettings';
import ProfessorMessageDashboard from '@/routes/professor/ProfessorMessageDashboard';

// Student Routes
import StudentCourses from '@/routes/student/StudentCourses';
import StudentBooks from '@/routes/student/StudentBooks';
import StudentLectures from '@/routes/student/StudentLectures';
import StudentExercises from '@/routes/student/StudentExercises';
import QuizBoard from '@/routes/student/QuizBoard';
import ProgressTracker from '@/routes/student/ProgressTracker';
import StudentSettings from '@/routes/student/StudentSettings';
import StudentCourseDetails from '@/routes/student/StudentCourseDetails';
import StudentMessageDashboard from '@/routes/student/StudentMessageDashboard';

// Shared
import RoleBasedOfflinePage from '@/components/system/RoleBasedOfflinePage';
import NotificationPage from '@/components/notification/NotificationPage';

export default function AmaiderLayout() {
  const { user } = useAuth();
  const allowedRoles = ['admin', 'professor', 'student'];
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <NetworkStatus />
      <GlobalBackgroundSync />
      <PWAInstallPrompt />
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Routes>
          {/* Admin */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/schools" element={<ManageSchools />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/courses" element={<CoursesOverview />} />
          <Route path="/books" element={<BooksViewOnly />} />
          <Route path="/lectures" element={<LecturesViewOnly />} />
          <Route path="/quizzes" element={<ExercisesAndQuizzesViewOnly />} />
          <Route path="/analytics" element={<StudentAnalytics />} />
          <Route path="/settings" element={<AdminSettings />} />

          {/* Professor */}
          <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
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

          {/* Student */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/student/my-courses" element={<StudentCourses />} />
          <Route path="/books/read" element={<StudentBooks />} />
          <Route path="/lectures/content" element={<StudentLectures />} />
          <Route path="/exercise/:id" element={<StudentExercises />} />
          <Route path="/quiz/:id" element={<QuizBoard />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/settings/student" element={<StudentSettings />} />
          <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
          <Route path="/student/message" element={<StudentMessageDashboard />} />

          {/* Shared */}
          <Route path="/offline/student" element={<RoleBasedOfflinePage />} />
          <Route path="/offline/professor" element={<RoleBasedOfflinePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Routes>
      </main>
    </div>
  );
}
