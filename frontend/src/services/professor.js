// services/professor.js
import { api } from './api';

export const getMyCourses = (id) => api.get(`courses/`);
export const getLatestSubmissions = () => api.get('/results/professor/latest-submissions');
export const getRecentThreads = () => api.get('/messages/recent-threads');

export const gradeExerciseSubmission = () =>api.get('/')