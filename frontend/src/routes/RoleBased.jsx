import { lazy } from 'react';

const AdminSettings = lazy(() => import('@/components/settings/AdminSettings'));
const ProfessorSettings = lazy(() => import('@/components/settings/ProfessorSettings'));
const StudentSettings = lazy(() => import('@/components/settings/StudentSettings'));

const AdminAnalytics = lazy(() => import('@/components/analytics/AdminAnalytics'));
const ProfessorAnalytics = lazy(() => import('@/components/analytics/ProfessorAnalytics'));
const StudentAnalytics = lazy(() => import('@/components/analytics/StudentAnalytics'));

const AdminOffline = lazy(() => import('@/components/offline/AdminOffline'));
const ProfessorOffline = lazy(() => import('@/components/offline/ProfessorOffline'));
const StudentOffline = lazy(() => import('@/components/offline/StudentOffline'));

const ProfessorExercises = lazy(() => import('@/components/exercises/ProfessorExercises'));
const StudentExercises = lazy(() => import('@/components/exercises/StudentExercises'));
const AdminExercises = lazy(_c19 = () => import("@/components/exercises/AdminExercises"));

const AdminQuizzes = lazy(() => import('@/components/quizzes/AdminQuizzes'));
const ProfessorQuizzes = lazy(() => import('@/components/quizzes/ProfessorQuizzes'));
const StudentQuizzes = lazy(() => import('@/components/quizzes/StudentQuizzes'));

const role = localStorage.getItem('role');

export function RoleBasedSettings() {
  if (role === 'admin') return <AdminSettings />;
  if (role === 'professor') return <ProfessorSettings />;
  if (role === 'student') return <StudentSettings />;
  return null;
}

export function RoleBasedAnalytics() {
  if (role === 'admin') return <AdminAnalytics />;
  if (role === 'professor') return <ProfessorAnalytics />;
  if (role === 'student') return <StudentAnalytics />;
  return null;
}

export function RoleBasedOffline() {
  if (role === 'admin') return <AdminOffline />;
  if (role === 'professor') return <ProfessorOffline />;
  if (role === 'student') return <StudentOffline />;
  return null;
}

export function RoleBasedExercises() {
  if (role === 'admin') return <AdminExercises />;
  if (role === 'professor') return <ProfessorExercises />;
  if (role === 'student') return <StudentExercises />;
  return null;
}

export function RoleBasedQuizzes() {
  if (role === 'admin') return <AdminQuizzes />;
  if (role === 'professor') return <ProfessorQuizzes />;
  if (role === 'student') return <StudentQuizzes />;
  return null;
}
