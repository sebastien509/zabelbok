// utils/ModuleStateManager.js

import { ModuleDB } from './ModuleDB';
import { saveCompletedOffline, syncCompletedModules } from '@/components2/moduleSync';
import { getModuleById } from '@/services/modules';

const COMPLETED_KEY = 'EstratejiCompletedModules';
const PROGRESS_PREFIX = 'module-progress-';

export const ModuleStateManager = {
  async getModuleStatus(moduleId, courseModules = []) {
    const isOnline = navigator.onLine;
    const completed = ModuleStateManager.getCompletedMap();
    const inLocal = localStorage.getItem(`${PROGRESS_PREFIX}${moduleId}`);
    const isCompleted = completed[moduleId];
    const isSavedOffline = !!(await ModuleDB.get(moduleId));

    const index = courseModules.findIndex((m) => m.id === moduleId);
    const isUnlocked = index === 0 || completed[courseModules[index - 1]?.id];

    if (isCompleted) return 'completed';
    if (inLocal) return 'resume';
    if (isSavedOffline || isUnlocked) return 'start';
    return 'locked';
  },

  async markCompleted(moduleId) {
    const completed = ModuleStateManager.getCompletedMap();
    completed[moduleId] = true;
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    await ModuleDB.markCompleted(moduleId);
    await saveCompletedOffline(moduleId);
    localStorage.removeItem(`${PROGRESS_PREFIX}${moduleId}`);
  },

  saveProgress(moduleId, currentTime) {
    localStorage.setItem(`${PROGRESS_PREFIX}${moduleId}`, currentTime);
  },

  clearProgress(moduleId) {
    localStorage.removeItem(`${PROGRESS_PREFIX}${moduleId}`);
  },

  getCompletedMap() {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '{}');
  },

  getCompletedIds() {
    return Object.keys(ModuleStateManager.getCompletedMap()).map((id) => parseInt(id));
  },

  getProgress(moduleId) {
    return parseFloat(localStorage.getItem(`${PROGRESS_PREFIX}${moduleId}`) || '0');
  },

  async getSyncStatus(moduleId) {
    const meta = await ModuleDB.getMeta(moduleId);
    return meta?.synced ? 'synced' : 'pending';
  },

  async getStorageUsageMB() {
    const blobs = await ModuleDB.getAllVideoBlobs();
    const totalBytes = blobs.reduce((sum, { blob }) => sum + (blob?.size || 0), 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  },

  async syncAllCompleted() {
    if (navigator.onLine) {
      await syncCompletedModules();
    } else {
      console.warn('[ModuleStateManager] Offline, cannot sync now');
    }
  },

  async getOfflineModulesByCourse(courseId) {
    const all = await ModuleDB.getAllMeta();
    return all.filter((m) => m.course_id === courseId);
  },

  async getResumeModule(courseModules) {
    const completed = ModuleStateManager.getCompletedMap();
    for (let i = 0; i < courseModules.length; i++) {
      const mod = courseModules[i];
      if (!completed[mod.id]) return mod;
    }
    return null;
  },

  async saveModuleOffline(mod) {
    try {
      const moduleData = await getModuleById(mod.id);
      await ModuleDB.addModuleMeta(moduleData);
      const videoRes = await fetch(moduleData.video_url);
      const blob = await videoRes.blob();
      await ModuleDB.addVideoBlob(mod.id, blob);
      return { success: true };
    } catch (err) {
      console.error('[ModuleStateManager] Failed to save module offline:', err);
      return { success: false, error: err };
    }
  }
};