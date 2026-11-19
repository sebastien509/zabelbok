import localforage from "localforage";

const META_KEY = "EstratejiModuleMeta";
const COMPLETION_DB = "EstratejiCompletionDB";
const TTL_HOURS_DEFAULT = 24;

const metaStore = localforage.createInstance({ name: META_KEY });
const blobStore = localforage.createInstance({ name: "EstratejiModuleBlobs" });
const completionStore = localforage.createInstance({ name: COMPLETION_DB });

export const ModuleDB = {
  // --------------------
  // META + BLOB
  // --------------------
  async addModuleMeta(module) {
    if (!module?.id) throw new Error("[ModuleDB] Module must have an ID");
    return metaStore.setItem(String(module.id), {
      ...module,
      id: Number(module.id),
      _cached_at: Date.now(),
    });
  },

  async getMeta(id) {
    return metaStore.getItem(String(id));
  },

  async hasBlob(id) {
    const blob = await blobStore.getItem(String(id));
    return !!blob;
  },

  async get(id) {
    const module = await metaStore.getItem(String(id));
    if (!module) return null;

    const blob = await blobStore.getItem(String(id));
    return { ...module, blob };
  },

  async getAllMeta() {
    const modules = [];
    await metaStore.iterate((value) => modules.push(value));
    return modules;
  },

  async getCourseModules(courseId) {
    const allMeta = await this.getAllMeta();
    return allMeta
      .filter((m) => Number(m.course_id) === Number(courseId))
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  },

  async addVideoBlob(id, blob) {
    return blobStore.setItem(String(id), blob);
  },

  async updateMeta(id, patch = {}) {
    const existing = await metaStore.getItem(String(id));
    if (!existing) return null;
    const updated = { ...existing, ...patch, id: Number(existing.id), _updated_at: Date.now() };
    await metaStore.setItem(String(id), updated);
    return updated;
  },

  async remove(id) {
    await metaStore.removeItem(String(id));
    await blobStore.removeItem(String(id));
    await completionStore.removeItem(String(id));
  },

  async clearAll() {
    await metaStore.clear();
    await blobStore.clear();
    await completionStore.clear();
    localStorage.removeItem("EstratejiCompletedModules");
  },

  // --------------------
  // COMPLETION (durable)
  // --------------------
  async markCompleted(id, completedAt = Date.now()) {
    await completionStore.setItem(String(id), completedAt);
    // also keep localStorage map for quick reads
    const map = JSON.parse(localStorage.getItem("EstratejiCompletedModules") || "{}");
    map[String(id)] = true;
    localStorage.setItem("EstratejiCompletedModules", JSON.stringify(map));

    // store in module meta too (optional but helpful)
    await this.updateMeta(id, { completed_at: completedAt, completed: true });
  },

  async isCompleted(id) {
    const v = await completionStore.getItem(String(id));
    return !!v;
  },

  async getAllCompletions() {
    const result = {};
    await completionStore.iterate((value, key) => {
      result[String(key)] = value; // timestamp
    });
    return result;
  },

  async removeCompletion(id) {
    await completionStore.removeItem(String(id));
    const map = JSON.parse(localStorage.getItem("EstratejiCompletedModules") || "{}");
    delete map[String(id)];
    localStorage.setItem("EstratejiCompletedModules", JSON.stringify(map));
    await this.updateMeta(id, { completed_at: null, completed: false });
  },

  async cleanupExpiredModules({ ttlHours = TTL_HOURS_DEFAULT } = {}) {
    const completions = await this.getAllCompletions();
    const now = Date.now();
    const expiredIds = [];

    for (const id in completions) {
      const completedAt = completions[id];
      const hoursPassed = (now - completedAt) / (1000 * 60 * 60);
      if (hoursPassed >= ttlHours) expiredIds.push(id);
    }

    for (const id of expiredIds) {
      await this.remove(id);
    }

    return { expired: expiredIds.length, ids: expiredIds };
  },
};
