import { api } from './api';

export const syncCourses = () => api.get('/offline/courses');
export const syncLectures = () => api.get('/offline/lectures');
export const syncBooks = () => api.get('/offline/books');
export const syncBookChapters = () => api.get('/offline/book-chapters');
export const syncQuizzes = () => api.get('/offline/quizzes');
export const syncQuizQuestions = () => api.get('/offline/quiz-questions');
export const syncExercises = () => api.get('/offline/exercises');
export const syncExerciseQuestions = () => api.get('/offline/exercise-questions');
export const syncMessages = () => api.get('/offline/messages');
export const fullSync = () => api.get('/offline/full_sync');

export const downloadCourseZip = (courseId) => 
  api.get(`/offline/download/${courseId}`, { responseType: 'blob' });

export const syncSubmissions = (submissions) => 
  api.post('/offline/sync', submissions);

// Enhanced offline sync with retry logic
export const retryOfflineSync = async () => {
  try {
    // Check if there are pending submissions
    const submissions = JSON.parse(localStorage.getItem('offlineSubmissions') || '[]');
    if (submissions.length > 0) {
      await syncSubmissions(submissions);
      localStorage.removeItem('offlineSubmissions');
    }

    // Check if full sync is needed
    const lastSync = localStorage.getItem('lastFullSync');
    const now = new Date();
    if (!lastSync || (now - new Date(lastSync)) > 24 * 60 * 60 * 1000) {
      await fullSync();
      localStorage.setItem('lastFullSync', now.toISOString());
    }
    
    return true;
  } catch (error) {
    console.error('Offline sync failed:', error);
    return false;
  }
};