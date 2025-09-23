// src/services/api.js
import axios from 'axios'

// In dev: use '/' so Vite proxy catches requests.
// In prod: use your Render URL from the env.
const baseURL = import.meta.env.DEV ? '/' : import.meta.env.VITE_API_URL

console.log('[api] baseURL =', baseURL, 'DEV?', import.meta.env.DEV)

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
