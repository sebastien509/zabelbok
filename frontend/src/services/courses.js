// ✅ src/services/courses.js
import { api } from './api';

// All Courses
export const getAllCourses = async () => {
    const res = await api.get('/courses');
    return res.data; // ✅ returns array only
  };
  export const getCourse = (id) => api.get(`/courses/${id}`);
export const getCourseDetails = (id) => api.get(`/courses/${id}`); // ⬅️ used in CourseDetails.jsx

// Create, Update, Delete
export const createCourse = (payload) => api.post('/courses', payload);
export const updateCourse = (id, payload) => api.put(`/courses/${id}`, payload);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

export const enrollStudentsToCourse = (courseId, studentIds) =>
    api.post(`/courses/${courseId}/enroll`, { student_ids: studentIds });
  
export const getEnrolledStudents = () => api.get('/auth/my-students');
export const getCoursesByProfessor = (id) => api.get(`courses/`);


export const getCourseById = (id) => api.get(`/courses/${id}`);

// ✅ Get role-specific courses (professor, student, etc.)
export async function getMyCourses() {
    try {
      const res = await api.get('/courses');
      return res.data;
    } catch (err) {
      console.error('[getMyCourses Error]', err);
      return [];
    }
  }
  
  // services/courses.js
export const getCoursesBySchool = async (schoolId = 1) => {
    const res = await api.get(`/courses/school/${schoolId}`);
    return res.data;
  };
  
  export const getPublicCoursesByCreator = async (professor_id) => {
    const res = await api.get(`/courses/public/creator/${professor_id}`);
    return res.data;
  };
  
  export const getPublicCoursesBySchool = async (school_id) => {
    const res = await api.get(`/courses/public/school/${school_id}`);
    return res.data;
  };
  