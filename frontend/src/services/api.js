import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // ✅ Add this line

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      toast("Network Error", { description: "Check your internet connection.", variant: "destructive" });
    } else if (error.response.status === 401) {
      toast("Unauthorized", { description: "Please login again.", variant: "destructive" });
    } else {
      toast(`Error ${error.response.status}`, {
        description: error.response.data.message || "Something went wrong.",
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  }
);

export default api;
