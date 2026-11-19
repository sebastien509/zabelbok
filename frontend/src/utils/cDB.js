import localforage from "localforage"

export const CourseDB = localforage.createInstance({
  name: "EstratejiCourseDB",
  storeName: "courses",
})

/**
 * Normalize any course shape into a consistent offline record.
 * Supports:
 * - course.id
 * - course.course_id
 * - nested { course: {...} }
 */
function normalizeCourse(course) {
  if (!course) return null

  const raw = course?.course ?? course
  const id = raw?.id ?? raw?.course_id

  if (!id) return null

  return {
    ...raw,
    id: Number(id),
  }
}

/**
 * Save the course object (strict offline).
 * This stores exactly what you pass—so pass a full bundle if needed.
 */
export async function save(course) {
  const normalized = normalizeCourse(course)
  if (!normalized?.id) throw new Error("[CourseDB] Course must have an ID")

  try {
    await CourseDB.setItem(String(normalized.id), normalized)
    return normalized
  } catch (err) {
    console.error("[CourseDB] Failed to save course:", err)
    throw err
  }
}

/**
 * Save a FULL offline bundle:
 * - course core fields
 * - modules array (so course is fully viewable offline)
 * - cached_at timestamp + schema version
 *
 * This is the function you should call from LearnerCourse.jsx after fetching
 * course + modules while online.
 */
export async function saveCourseBundleMeta(course, modules = []) {
  const normalized = normalizeCourse(course)
  if (!normalized?.id) throw new Error("[CourseDB] Course must have an ID")

  // minimal module shape (store only what's needed offline)
  const safeModules = Array.isArray(modules)
    ? modules.map((m) => ({
        id: Number(m.id),
        course_id: Number(m.course_id ?? normalized.id),
        title: m.title,
        description: m.description,
        order: Number(m.order ?? 0),
        video_url: m.video_url, // still useful even if offline blob is in ModuleDB
        caption_url: m.caption_url,
        transcript: m.transcript, // optional if returned
        duration: m.duration,
        quiz: m.quiz, // optional if returned
        created_at: m.created_at,
      }))
    : []

  const bundle = {
    ...normalized,
    modules: safeModules,
    __offline: {
      schema: 1,
      cached_at: Date.now(),
      module_count: safeModules.length,
    },
  }

  await CourseDB.setItem(String(bundle.id), bundle)
  return bundle
}

/**
 * Get course (and possibly embedded modules if saved as a bundle).
 */
export async function get(id) {
  try {
    return await CourseDB.getItem(String(id))
  } catch (err) {
    console.error("[CourseDB] Failed to get course:", err)
    return null
  }
}

/**
 * Convenience: ensure you always get a "bundle-like" object.
 * If old course record doesn't have modules, you'll still receive it safely.
 */
export async function getCourseBundle(id) {
  const course = await get(id)
  if (!course) return null

  return {
    ...course,
    id: Number(course.id),
    modules: Array.isArray(course.modules) ? course.modules : [],
    __offline: course.__offline || { schema: 1, cached_at: null, module_count: 0 },
  }
}

export async function getAll() {
  const courses = []
  try {
    await CourseDB.iterate((value) => {
      courses.push(value)
    })
  } catch (err) {
    console.error("[CourseDB] Failed to get all courses:", err)
  }
  return courses
}

export async function remove(id) {
  try {
    await CourseDB.removeItem(String(id))
  } catch (err) {
    console.error("[CourseDB] Failed to remove course:", err)
  }
}

export async function clearAll() {
  try {
    await CourseDB.clear()
  } catch (err) {
    console.error("[CourseDB] Failed to clear all courses:", err)
  }
}
