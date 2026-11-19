import localforage from "localforage";
import axios from "axios";

const SyncDB = localforage.createInstance({
  name: "EstratejiSyncDB",
  storeName: "sync",
});

const QUEUE_KEY = "pending_module_completions";

// change if needed
const SYNC_ENDPOINT = (moduleId) => `/modules/${moduleId}/progress`;

function getToken() {
  // adjust if you store token differently
  return localStorage.getItem("token") || localStorage.getItem("access_token");
}

function apiClient() {
  const baseURL = import.meta.env.VITE_API_URL || "";
  const token = getToken();
  return axios.create({
    baseURL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function queueCompletedModule({ moduleId, courseId = null, completedAt = Date.now() }) {
  const queue = (await SyncDB.getItem(QUEUE_KEY)) || [];
  const exists = queue.some((x) => Number(x.moduleId) === Number(moduleId));
  if (!exists) {
    queue.push({ moduleId: Number(moduleId), courseId: courseId ? Number(courseId) : null, completedAt });
    await SyncDB.setItem(QUEUE_KEY, queue);
  }
  return queue.length;
}

export async function getCompletionQueue() {
  return (await SyncDB.getItem(QUEUE_KEY)) || [];
}

export async function clearCompletionQueue() {
  await SyncDB.setItem(QUEUE_KEY, []);
}

export async function syncQueuedCompletions() {
  if (!navigator.onLine) return { ok: false, reason: "offline" };

  const token = getToken();
  if (!token) return { ok: false, reason: "no_token" };

  const queue = (await SyncDB.getItem(QUEUE_KEY)) || [];
  if (queue.length === 0) return { ok: true, synced: 0 };

  const api = apiClient();
  const stillPending = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await api.post(SYNC_ENDPOINT(item.moduleId), {
        completed_at: item.completedAt,
        course_id: item.courseId,
      });
      synced += 1;
    } catch (err) {
      // keep it queued
      stillPending.push(item);
    }
  }

  await SyncDB.setItem(QUEUE_KEY, stillPending);
  return { ok: true, synced, pending: stillPending.length };
}
