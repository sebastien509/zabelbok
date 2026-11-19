// ✅ src/services/payments.js
import { api } from "./api";

/**
 * Direct Stripe checkout creation (fallback/optional).
 * Your backend currently supports: POST /payments/checkout-session
 * It expects { course_id, price? } where price is in USD dollars (not cents).
 *
 * NOTE: If you switch fully to the /enrollments 402 flow, you may not need this.
 */
export async function createCheckoutSession({ course_id, price_usd }) {
  const payload = { course_id };
  if (typeof price_usd === "number") payload.price = price_usd;

  const res = await api.post("/payments/checkout-session", payload);
  return res.data; // { url }
}

/**
 * Helper: redirect user to Stripe Checkout
 */
export function redirectToCheckout(url) {
  if (!url) throw new Error("Missing checkout URL");
  window.location.href = url;
}
