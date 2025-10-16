// src/services/api.js
import axios from 'axios'

// In dev: use '/' so Vite proxy catches requests.
// In prod: use your Render URL from the env.
// Check what VITE_API_URL actually contains
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)

// More robust approach
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://e-strateji.onrender.com')

console.log('Final baseURL:', baseURL)

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
