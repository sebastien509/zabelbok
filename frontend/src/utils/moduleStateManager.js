import { ModuleDB } from "./ModuleDB";
import { queueCompletedModule, syncQueuedCompletions } from "@/utils/moduleSync";

const COMPLETED_KEY = "EstratejiCompletedModules";
const PROGRESS_PREFIX = "module-progress-";

export const ModuleStateManager = {
  /**
   * Status rules:
   * - completed if completed map says so (durable)
   * - resume if local progress exists
   * - start if saved offline (has blob) OR unlocked by previous completion
   * - locked otherwise
   */
  async getModuleStatus(moduleId, courseModules = []) {
    const completedMap = await ModuleStateManager.getCompletedMap();
    const inLocal = localStorage.getItem(`${PROGRESS_PREFIX}${moduleId}`);
    const isCompleted = !!completedMap[String(moduleId)];
    const isSavedOffline = await ModuleDB.hasBlob(moduleId);

    const index = courseModules.findIndex((m) => Number(m.id) === Number(moduleId));
    const prevId = index > 0 ? courseModules[index - 1]?.id : null;
    const isUnlocked = index === 0 || !!completedMap[String(prevId)];

    if (isCompleted) return "completed";
    if (inLocal) return "resume";
    if (isSavedOffline || isUnlocked) return "start";
    return "locked";
  },

  async markCompleted(moduleId, { courseId = null } = {}) {
    const completedAt = Date.now();

    // durable completion
    await ModuleDB.markCompleted(moduleId, completedAt);

    // queue sync (durable)
    await queueCompletedModule({ moduleId, courseId, completedAt });

    // clear resume
    localStorage.removeItem(`${PROGRESS_PREFIX}${moduleId}`);
  },

  saveProgress(moduleId, currentTime) {
    localStorage.setItem(`${PROGRESS_PREFIX}${moduleId}`, String(currentTime));
  },

  clearProgress(moduleId) {
    localStorage.removeItem(`${PROGRESS_PREFIX}${moduleId}`);
  },

  async getCompletedMap() {
    // localStorage quick map
    const local = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "{}");

    // merge with durable completion store (in case localStorage cleared)
    const completions = await ModuleDB.getAllCompletions();
    for (const id of Object.keys(completions)) {
      local[String(id)] = true;
    }

    // re-save merged map
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(local));
    return local;
  },

  getProgress(moduleId) {
    return parseFloat(localStorage.getItem(`${PROGRESS_PREFIX}${moduleId}`) || "0");
  },

  async cleanupExpiredIfOnline({ ttlHours = 24 } = {}) {
    if (!navigator.onLine) return;
    await ModuleDB.cleanupExpiredModules({ ttlHours });
  },

  async syncAllCompleted() {
    if (!navigator.onLine) return;
    await syncQueuedCompletions();
  },

  async saveModuleOffline(mod) {
    try {
      // mod must at least include id and video_url must be fetchable
      // NOTE: you already have getModuleById elsewhere; call it here if you need full meta
      const videoUrl = mod.video_url;
      if (!videoUrl) throw new Error("No video_url on module");

      // ensure meta saved
      await ModuleDB.addModuleMeta(mod);

      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`Video fetch failed (${res.status})`);
      const blob = await res.blob();

      await ModuleDB.addVideoBlob(mod.id, blob);
      await ModuleDB.updateMeta(mod.id, { offline_saved_at: Date.now() });

      return { success: true };
    } catch (err) {
      console.error("[ModuleStateManager] Failed to save module offline:", err);
      return { success: false, error: err };
    }
  },
};
