// ✅ src/services/auth.js
import axios from 'axios';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  const res = await api.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const register = async (payload) => {
  const res = await api.post(`${API_URL}/auth/register`, payload);
  return res.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');

  const res = await api.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getUserCourses = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get(`${API_URL}/auth/me/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getUserSubmissions = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get(`${API_URL}/auth/me/submissions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateUser = async (payload) => {
  const token = localStorage.getItem('token');
  const res = await api.put(`/auth/me`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// ✅ services/users.js
export const getAllStudents = () => api.get('/auth/role/student');


export const getUsersByRole = (role) => api.get(`/auth/role/${role}`);
// services/users.js
export const getMyStudents = () => api.get('/auth/my-students');


/**
 * Update the logged-in user's profile settings.
 * Can include: bio, language, profile_image_url
 * 
 * @param {Object} data - Partial update fields.
 * @returns {Object} Updated user data
 */
export async function updateProfile(data) {
  try {
    const res = await api.put('/auth/me/profile', data);
    return res.data.user;
  } catch (err) {
    console.error('[updateProfile Error]', err);
    throw err;
  }
}

export const getAllCreators = () => api.get('/auth/creators');

// services/auth.js
export const updateStyle = async ({ theme, banner_url }) => {
  return api.put('/auth/me/style', { theme, banner_url });
};

export const getMe = () => api.get('/auth/me').then((res) => res.data);



export const getUserById = async (id) => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

    const res = await api.get(`/creators/public/${id}`);
    return res.data;
  };
  

