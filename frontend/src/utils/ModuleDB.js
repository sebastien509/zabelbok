import localforage from 'localforage';

const META_KEY = 'EstratejiModuleMeta';
const COMPLETION_KEY = 'EstratejiCompletedModules';
const TTL_HOURS = 24;

const metaStore = localforage.createInstance({ name: META_KEY });
const blobStore = localforage.createInstance({ name: 'EstratejiModuleBlobs' });

export const ModuleDB = {
  async addModuleMeta(module) {
    return metaStore.setItem(String(module.id), module);
  },

  async get(id) {
    const module = await metaStore.getItem(String(id));
    if (!module) return null;

    const blob = await blobStore.getItem(String(id));
    return { ...module, blob };
  },

  async getAll() {
    const modules = [];
    await metaStore.iterate((value) => modules.push(value));
    return modules;
  },
  async getCourseModules(courseId) {
    const allMeta = await this.getAllMeta();
    return allMeta.filter(m => m.course_id === courseId).sort((a, b) => a.order - b.order);
  },
  
  async getAllMeta() {
    return this.getAll();
  },

  async addVideoBlob(id, blob) {
    return blobStore.setItem(String(id), blob);
  },

  async remove(id) {
    await metaStore.removeItem(String(id));
    await blobStore.removeItem(String(id));
  },

  async clearAll() {
    await metaStore.clear();
    await blobStore.clear();
    localStorage.removeItem(COMPLETION_KEY);
  },

  async markCompleted(id) {
    const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}');
    completions[id] = Date.now();
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
  },

  async isCompleted(id) {
    const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}');
    return !!completions[id];
  },

  async removeCompletion(id) {
    const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}');
    delete completions[id];
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
  },

  async cleanupExpiredModules() {
    const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}');
    const now = Date.now();
    const expiredIds = [];

    for (const id in completions) {
      const completedAt = completions[id];
      const hoursPassed = (now - completedAt) / (1000 * 60 * 60);
      if (hoursPassed >= TTL_HOURS) {
        expiredIds.push(id);
      }
    }

    for (const id of expiredIds) {
      await this.remove(id);
      delete completions[id];
    }

    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
  }
};
