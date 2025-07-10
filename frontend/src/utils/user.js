// src/utils/user.js

export function getUserFromCache() {
    try {
      const cached = localStorage.getItem('userCache');
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.error('Error parsing user from cache:', err);
      return null;
    }
  }
  
  