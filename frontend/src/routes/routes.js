import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

import ManageSchools from '@/routes/admin/ManageSchools';
import ManageUsers from '@/routes/admin/ManageUsers';
import CoursesOverview from '@/routes/admin/CoursesOverview';
import BooksViewOnly from '@/routes/admin/BooksViewOnly';
import LecturesViewOnly from '@/routes/admin/LecturesViewOnly';
import ExercisesAndQuizzesViewOnly from '@/routes/admin/ExercisesAndQuizzesViewOnly';
import StudentAnalytics from '@/routes/admin/StudentAnalytics';
import AdminSettings from '@/routes/admin/AdminSettings';
import AdminMessageDashboard from './admin/AdminMessageDashboard';
import AdminOffline from '@/components/offline/AdminOffline';

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
import ProfessorMessageDashboard from './professor/ProfessorMessageDashboard';
import ProfessorOffline from '@/components/offline/ProfessorOffline';

import StudentCourses from '@/routes/student/StudentCourses';
import StudentBooks from '@/routes/student/StudentBooks';
import StudentLectures from '@/routes/student/StudentLectures';
import StudentExercises from '@/routes/student/StudentExercises';
import ProgressTracker from '@/routes/student/ProgressTracker';
import StudentOfflineContent from '@/routes/student/StudentOfflineContent';
import StudentSettings from '@/routes/student/StudentSettings';
import StudentMessageDashboard from './student/StudentMessageDashboard';
import QuizBoard from './student/QuizBoard';
import StudentCourseDetails from '@/routes/student/StudentCourseDetails';
import StudentOffline from '@/components/offline/StudentOffline';
import ProfessorOfflineContent from './professor/ProfessorOfflineContent';


export const routes = {
  admin: [
    { path: '/dashboard/admin', label: 'dashboard', component: AdminDashboard },
    { path: '/schools', label: 'manageSchools', component: ManageSchools },
    { path: '/users', label: 'manageUsers', component: ManageUsers },
    { path: '/courses', label: 'coursesOverview', component: CoursesOverview },
    { path: '/books', label: 'books', component: BooksViewOnly },
    { path: '/lectures', label: 'lectures', component: LecturesViewOnly },
    { path: '/quizzes', label: 'quizzes', component: ExercisesAndQuizzesViewOnly },
    { path: '/analytics', label: 'studentTracking', component: StudentAnalytics },
    { path: '/settings', label: 'settings', component: AdminSettings },
    { path: '/admin/message', label: 'message', component: AdminMessageDashboard },
    { path: '/offline/admin', label: 'offlineSystem', component: AdminOffline }
  ],
  professor: [
    { path: '/dashboard/professor', label: 'dashboard', component: ProfessorDashboard },
    { path: '/my-courses', label: 'myCourses', component: MyCourses },
    { path: '/courses/:id', label: 'courseDetails', component: CourseDetails },
    { path: '/students', label: 'myStudents', component: MyStudents },
    { path: '/books/manage', label: 'manageBookChapters', component: ManageBookChapters },
    { path: '/lectures/manage', label: 'manageLectures', component: ManageLectures },
    { path: '/exercises', label: 'exercises', component: ProfessorExercises },
    { path: '/quizzes/manage', label: 'quizzes', component: ProfessorQuizzes },
    { path: '/tracking', label: 'studentTracking', component: ProfessorTracking },
    { path: '/analytics/professor', label: 'courseAnalytics', component: CourseAnalytics },
    { path: '/settings/professor', label: 'settings', component: ProfessorSettings },
    { path: '/professor/message', label: 'message', component: ProfessorMessageDashboard },
    { path: '/offline/professor', label: 'offlineContent', component: ProfessorOfflineContent }
  ],
  student: [
    { path: '/dashboard/student', label: 'dashboard', component: StudentDashboard },
    { path: '/student/courses/:id', label: 'courseDetails', component: StudentCourseDetails },
    { path: '/student/my-courses', label: 'myCourses', component: StudentCourses },
    { path: '/books/read', label: 'books', component: StudentBooks },
    { path: '/lectures/content', label: 'lectures', component: StudentLectures },
    { path: '/exercises/solve', label: 'exercises', component: StudentExercises },
    { path: '/progress', label: 'progressTracker', component: ProgressTracker },
    { path: '/offline', label: 'offlineContent', component: StudentOfflineContent },
    { path: '/settings/student', label: 'settings', component: StudentSettings },
    { path: '/student/message', label: 'message', component: StudentMessageDashboard },
    { path: '/student/Quiz', label: 'quizBoard', component: QuizBoard },
    { path: '/offline/student', label: 'offlineContent', component: StudentOffline }
  ],
  shared: [

  ]
};
