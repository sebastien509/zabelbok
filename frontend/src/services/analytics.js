import { api } from './api';

// Admin Analytics
export const getGeneralAnalytics = () => api.get('/analytics/general');
export const getActivityLogs = () => api.get('/analytics/logs');
export const getTopActiveUsers = () => api.get('/analytics/activity/top-users');
export const getActivityByEvent = () => api.get('/analytics/activity/by-event');
export const getDailyActivityCounts = () => api.get('/analytics/activity/daily');

// Professor Analytics
export const getCourseAnalytics = () => api.get('/analytics/my-courses');
export const getQuizAnalytics = (quiz_id) => api.get(`/analytics/quiz/${quiz_id}`);
export const getCourseEngagement = (course_id) => api.get(`/analytics/course/${course_id}/engagement`);

// Shared
export const getUserActivityTimeline = (user_id) => api.get(`/analytics/user/${user_id}/timeline`);
