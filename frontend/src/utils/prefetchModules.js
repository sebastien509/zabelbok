import { ModuleDB } from '@/utils/ModuleDB';
import { getModuleById } from '@/services/modules';

/**
 * Prefetch and store the metadata + video blob for the provided modules
 * @param {Array} modules - Array of modules (must include `id`)
 * @param {number} limit - Max number of modules to prefetch
 */
export async function prefetchModules(modules = [], limit = 2) {
  const targets = modules.slice(0, limit);

  for (const mod of targets) {
    try {
      const alreadySaved = await ModuleDB.get(mod.id);
      if (alreadySaved?.blob) {
        console.log(`📦 Module ${mod.id} already cached.`);
        continue;
      }

      const fullMod = await getModuleById(mod.id);
      if (!fullMod?.video_url) {
        console.warn(`⚠️ Skipping module ${mod.id} — no video URL.`);
        continue;
      }

      await ModuleDB.addModuleMeta(fullMod);

      const res = await fetch(fullMod.video_url);
      const blob = await res.blob();
      await ModuleDB.addVideoBlob(mod.id, blob);

      console.log(`✅ Prefetched module: ${fullMod.title}`);
    } catch (err) {
      console.error(`❌ Error prefetching module ${mod.id}:`, err);
    }
  }
}
