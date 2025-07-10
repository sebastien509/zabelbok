import { api } from "./api";
import { toast } from "@/components/ui/use-toast";

export const enrollInCourse = async (courseId) => {
  try {
    const res = await api.post('/enrollments', { course_id: courseId });
    toast('Enrollment Successful', { description: res.data.message });
    setEnrolledCourseIds(prev => [...prev, courseId]);
  } catch (err) {
    toast('Enrollment Failed', { description: err.response?.data?.error || 'Try again' });
  }
};


export const getMyEnrollments = async () => {
  const res = await api.get('/enrollments/me/e');
  return res.data; // returns array of course_ids
};
