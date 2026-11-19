// src/services/revenue.js
import { api } from './api';

// Helpers
const unwrap = (res) => res?.data ?? res;



export async function getCreatorCourseRevenueSummary(courseId, params = {}) {
  // GET /revenue/creator/course/:id/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
  const res = await api.get(`/revenue/creator/course/${courseId}/summary`, { params });
  return unwrap(res);
}


export const getCreatorRevenueSummary = ({ start, end } = {}) =>
    api
      .get("/revenue/creator/summary", { params: { start, end } })
      .then((res) => res.data);
  
  export const getCreatorCoursesRevenueTable = ({ start, end } = {}) =>
    api
      .get("/revenue/creator/courses", { params: { start, end } })
      .then((res) => res.data);