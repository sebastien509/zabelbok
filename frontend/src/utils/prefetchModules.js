// utils/prefetchModules.js
import { ModuleDB } from "@/utils/ModuleDB"
import { getModuleById } from "@/services/modules"

function unwrapAxios(res) {
  return res?.data ?? res
}

/**
 * Prefetch modules + store meta + blob to IndexedDB
 * @param {Array} modules - course modules [{id, order, ...}]
 * @param {number} limit - how many to prefetch
 * @param {number|null} fromOrder - prefetch modules after this order (optional)
 */
export async function prefetchModules(modules = [], limit = 2, fromOrder = null) {
  if (!navigator.onLine) return

  // sort by order to be deterministic
  const sorted = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const targets =
    fromOrder === null
      ? sorted.slice(0, limit)
      : sorted.filter((m) => (m.order ?? 0) > fromOrder).slice(0, limit)

  for (const mod of targets) {
    try {
      const meta = await ModuleDB.getMeta(mod.id)
      const hasBlob = await ModuleDB.hasBlob(mod.id)
      if (meta && hasBlob) continue

      const res = await getModuleById(mod.id)
      const full = unwrapAxios(res)
      if (!full?.video_url) continue

      await ModuleDB.addModuleMeta(full)

      const r = await fetch(full.video_url)
      if (!r.ok) throw new Error(`fetch failed ${r.status}`)
      const blob = await r.blob()
      await ModuleDB.addVideoBlob(full.id, blob)

      console.log(`✅ Prefetched (durable): ${full.title}`)
    } catch (e) {
      console.warn(`⚠️ Prefetch failed for module ${mod.id}:`, e)
    }
  }
}
