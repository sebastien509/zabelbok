// ✅ src/services/auth.js
import axios from 'axios';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL;

// services/auth.js
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const getCurrentUser2 = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// style update now accepts color + slug
export const updateStyle = ({ theme, banner_url, color, slug }) =>
  api.put('/auth/me/style', { theme, banner_url, color, slug });

// public fetchers
export const getPublicBySlug = (slug) => api.get(`/auth/public/slug/${encodeURIComponent(slug)}`)
  .then(r => r.data);



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
export const getMe = () => api.get('/auth/me').then((res) => res.data);



export const getUserById = async (id) => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

    const res = await api.get(`/auth/public/${id}`);
    return res.data;
  };
  

  export const checkSlugAvailable = async (slug) => {
    const { data } = await api.get(`/auth/slug-available/${encodeURIComponent(slug)}`)
    return data // { slug, available: boolean }
  }