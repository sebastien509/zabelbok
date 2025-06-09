// services/student.js
import { api } from './api';

export const getEnrolledCourses = () => api.get('/courses');
export const getPendingAssignments = () => api.get('/progress/upcoming');
export const getRecentThreads = () => api.get('/messages/recent-threads');