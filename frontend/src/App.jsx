import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import NetworkStatus from './components/system/NetworkStatus';
import PWAInstallPrompt from './PWAInstallPrompt';
import GlobalBackgroundSync from './components/system/GlobalBackgroundSync';
import Sidebar from './components/system/Sidebar';
import i18n from 'i18next';


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

export default function App() {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
      const lng = localStorage.getItem('i18nextLng') || 'fr';
      i18n.changeLanguage(lng);
      console.log('Language changed to', lng);


    
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    setRole(storedRole);
    setToken(storedToken);
    setLoading(false);
  }, []);

  if (loading) return null; 

  return (
    <>
      <NetworkStatus />
      <GlobalBackgroundSync />
      <PWAInstallPrompt />
      <div className="flex h-screen overflow-hidden">
        {token && <Sidebar />}
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboards */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />

            {/* Admin Only */}
            <Route path="/schools" element={<ManageSchools />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/courses" element={<CoursesOverview />} />
            <Route path="/books" element={<BooksViewOnly />} />
            <Route path="/lectures" element={<LecturesViewOnly />} />
            <Route path="/quizzes" element={<ExercisesAndQuizzesViewOnly />} />
            <Route path="/analytics" element={<StudentAnalytics />} />
            <Route path="/settings" element={<AdminSettings />} />

            {/* Professor Only */}
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





            {/* Student Only */}
            <Route path="/student/my-courses" element={<StudentCourses />} />
            <Route path="/books/read" element={<StudentBooks />} />
            <Route path="/lectures/watch" element={<StudentLectures />} />
            <Route path="/exercises/solve" element={<StudentExercises />} />
            <Route path="/progress" element={<ProgressTracker />} />
            <Route path="/settings/student" element={<StudentSettings />} />
            <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
            <Route path="/student/Quiz" element={<QuizBoard/>}  />
            <Route path="/student/message" element={<StudentMessageDashboard />} />
            <Route path="/offline/student" element={<RoleBasedOfflinePage />} />




            {/* Shared */}
      
            {/* <Route path="/offline/" element={<RoleBasedOfflinePage />} /> */}
     


            {/* Redirects */}
            {role === 'admin' && <Route path="*" element={<Navigate to="/dashboard/admin" />} />}
            {role === 'professor' && <Route path="*" element={<Navigate to="/dashboard/professor" />} />}
            {role === 'student' && <Route path="*" element={<Navigate to="/dashboard/student" />} />}
            {!role && <Route path="*" element={<Navigate to="/" />} />}
          </Routes>
        </main>
      </div>
    </>
  );
}
