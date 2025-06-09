// ✅ src/services/courses.js
import { api } from './api';

// All Courses
export const getAllCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const getCourseDetails = (id) => api.get(`/courses/${id}`); // ⬅️ used in CourseDetails.jsx

// Create, Update, Delete
export const createCourse = (payload) => api.post('/courses', payload);
export const updateCourse = (id, payload) => api.put(`/courses/${id}`, payload);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

export const enrollStudentsToCourse = (courseId, studentIds) =>
    api.post(`/courses/${courseId}/enroll`, { student_ids: studentIds });
  
export const getEnrolledStudents = () => api.get('/auth/my-students');
