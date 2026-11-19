// ✅ src/services/publish.js
import { api } from "./api";


export const isPublishReady = (course) => {
  const titleOk = !!String(course?.title || "").trim();
  const descOk = !!String(course?.description || "").trim();

  const modules = extractModulesArray(course);
  const moduleCount =
    modules.length > 0
      ? modules.length
      : Number(course?.module_count ?? course?.modules_count ?? 0) || 0;

  const moduleOk = moduleCount >= 1;

  const isPaid = !!(course?.payments?.is_paid ?? course?.is_paid);
  const priceCents =
    Number(course?.payments?.price_cents ?? course?.price_cents ?? 0) || 0;

  const freeOk = !isPaid && priceCents === 0;
  const paidOk = isPaid && priceCents > 0;

  return titleOk && descOk && moduleOk && (freeOk || paidOk);
};

/**
 * Optional: convenience getter for pricing UI
 */
export const getCoursePricing = (course) => {
  const is_paid = !!(course?.payments?.is_paid ?? course?.is_paid);
  const price_cents = Number(course?.payments?.price_cents ?? course?.price_cents ?? 0) || 0;
  const currency = (course?.payments?.currency ?? course?.currency ?? "usd").toLowerCase();
  return { is_paid, price_cents, currency };
};

// ✅ src/services/publish.js
const normalizePublishPayload = (payload = {}) => {
  const is_paid = payload.is_paid === true; // strict boolean

  const price_cents =
    payload.price_cents != null
      ? Number(payload.price_cents)
      : payload.price != null
      ? Math.round(Number(payload.price) * 100)
      : 0;

  const currency = (payload.currency || "usd").toLowerCase();

  return {
    is_paid,
    price_cents: Number.isFinite(price_cents) ? Math.max(0, Math.trunc(price_cents)) : 0,
    currency,
  };
};

export const publishCourse = async (courseId, payload = {}) => {
  const body = normalizePublishPayload(payload);

  // ✅ IMPORTANT: override any global multipart default
  const res = await api.post(`/courses/${courseId}/publish`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data;
};

export const unpublishCourse = async (courseId) => {
  const res = await api.post(`/courses/${courseId}/unpublish`, {}, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateCoursePricing = async (courseId, payload = {}) => {
  const body = normalizePublishPayload(payload);
  const res = await api.patch(`/courses/${courseId}/pricing`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
