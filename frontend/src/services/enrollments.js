// ✅ src/services/enrollments.js
import { api } from "./api";

/**
 * Warm-cache endpoint:
 * GET /enrollments/me -> { items: [{ course, progress, completed_at }], meta }
 */
export async function getMyEnrollments(params = {}) {
  const { data } = await api.get("/enrollments/me", { params });
  return data; // { items, meta }
}

/** Raw rows */
export async function getMyEnrollmentRows() {
  const { data } = await api.get("/enrollments/me/rows");
  return data; // array
}

/**
 * Enroll:
 * - free -> 201 { enrollment_id, course }
 * - paid -> 402 { checkout_url }
 */
export async function enrollInCourse(courseId) {
  try {
    const res = await api.post("/enrollments", { course_id: courseId });
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 402 && data?.checkout_url) {
      return { ok: false, payment_required: true, status, data };
    }
    return { ok: false, payment_required: false, status: status || 0, data };
  }
}

/** After Stripe success redirect */
export async function finalizePaidEnrollment(courseId, sessionId) {
  const { data } = await api.post("/enrollments", {
    course_id: courseId,
    session_id: sessionId,
  });
  return data;
}

/** Mark completed */
export async function completeCourse(courseId) {
  const { data } = await api.post(`/enrollments/complete/${courseId}`);
  return data;
}
