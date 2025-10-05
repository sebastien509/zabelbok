// ✅ src/services/courses.js
import { api } from './api';

// --- Helpers ----------------------------------------------------
const toArray = (data) => {
  // Accept { items, meta }, [] or null
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return []; // fallback to empty so callers don't crash
};

// Optionally let callers request pagination, but keep old signature working.
const withParams = (path, params) => {
  if (!params) return api.get(path);
  return api.get(path, { params });
};

// --- Reads ------------------------------------------------------

// All Courses (role-aware: admin/professor/student)
// Old callers expect an array; we normalize to array.
export const getAllCourses = async (params) => {
  const res = await withParams('/courses', params);
  return toArray(res.data);
};

// Single course (details). Keeps the exact shape returned by backend route.
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const getCourseDetails = (id) => api.get(`/courses/${id}`);

// Courses for the current professor (your route already scopes by role).
// Kept signature; returns array.
export const getCoursesByProfessor = async (/* id unused; kept for compat */) => {
  const res = await api.get('/courses');
  return toArray(res.data);
};

// School-scoped (private) — normalize to array even if API returns {items, meta}
export const getCoursesBySchool = async (schoolId = 1, params) => {
  const res = await withParams(`/courses/school/${schoolId}`, params);
  return toArray(res.data);
};

// Public lists — normalize to array
export const getPublicCoursesByCreator = async (professor_id, params) => {
  const res = await withParams(`/courses/public/creator/${professor_id}`, params);
  return toArray(res.data);
};

export const getPublicCoursesBySchool = async (school_id, params) => {
  const res = await withParams(`/courses/public/school/${school_id}`, params);
  return toArray(res.data);
};

// Convenience alias used elsewhere — normalize to array
export async function getMyCourses(params) {
  try {
    const res = await withParams('/courses', params);
    return toArray(res.data);
  } catch (err) {
    console.error('[getMyCourses Error]', err);
    return [];
  }
}

// --- Mutations --------------------------------------------------

// Create / Update / Delete (unchanged signatures)
export const createCourse = (payload) => api.post('/courses', payload);
export const updateCourse = (id, payload) => api.put(`/courses/${id}`, payload);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Enroll students (unchanged)
export const enrollStudentsToCourse = (courseId, studentIds) =>
  api.post(`/courses/${courseId}/enroll`, { student_ids: studentIds });

// Used elsewhere; leaving as-is
export const getEnrolledStudents = () => api.get('/auth/my-students');

// --- Optional new helper (doesn't break anything) ---------------
// If you start using the pricing patch route from the backend:
export const updateCoursePricing = (id, payload) =>
  api.patch(`/courses/${id}/pricing`, payload);

// --- Optional publish helpers (names new; safe to ignore if unused) ---
export const publishCourse = (id) => api.post(`/courses/${id}/publish`);
export const unpublishCourse = (id) => api.post(`/courses/${id}/unpublish`);
