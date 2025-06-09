import { api } from './api';

export const getAllLectures = () => api.get('/lectures/');
export const getLecture = (id) => api.get(`/lectures/${id}`);
export const createLecture = (payload) => api.post('/lectures/', payload);
export const updateLecture = (id, payload) => api.put(`/lectures/${id}`, payload);
export const deleteLecture = (id) => api.delete(`/lectures/${id}`);