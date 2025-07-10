import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Setup baseURL from .env
const BASE_URL = 'https://e-strateji.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token automatically into all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      toast( "Network Error",{ description: "Check your internet connection.", variant: "destructive" });
    } else if (error.response.status === 401) {
      toast( "Unauthorized", {description: "Please login again.", variant: "destructive" });
      // Optional: redirect to login page
    } else {
      toast( `Error ${error.response.status}`, {description: error.response.data.message || "Something went wrong.", variant: "destructive" });
    }
    return Promise.reject(error);
  }
);
export default api