// services/modules.js
import api from './api';

/**
 * Process uploaded video into transcript + quiz (pre-publish review).
 * payload: { title, description, course_id, order, created_at, video_url }
 * returns: { transcript, quiz_questions, caption_url, duration_sec, language }
 */
export async function createModule(payload) {
  try {
    const { data } = await api.post('/modules/process', payload);
    return data;
  } catch (err) {
    console.error('[createModule/process Error]', err);
    throw err;
  }
}

/**
 * Publish module after review (persists Module + Quiz).
 * payload: { title, description, course_id, order, created_at, video_url, transcript, quiz, caption_url? }
 * returns: saved module (to_dict with include_nested)
 */
export async function publishReviewedModule(payload) {
  try {
    const { data } = await api.post('/modules/publish', payload);
    return data;
  } catch (err) {
    console.error('[publishReviewedModule Error]', err);
    throw err;
  }
}

/** Get all modules for a course */
export async function getModulesByCourse(courseId) {
  try {
    const { data } = await api.get(`/modules/course/${courseId}`);
    return data;
  } catch (err) {
    console.error(`[getModulesByCourse Error for course ${courseId}]`, err);
    return [];
  }
}

/** Get a single module by ID */
export async function getModuleById(moduleId) {
  try {
    const { data } = await api.get(`/modules/${moduleId}`);
    return data;
  } catch (err) {
    console.error(`[getModuleById Error for ID ${moduleId}]`, err);
    return null;
  }
}

/** Update a module (e.g., transcript, caption_url, order, title, etc.) */
export async function updateModule(moduleId, payload) {
  try {
    const { data } = await api.put(`/modules/${moduleId}`, payload);
    return data;
  } catch (err) {
    console.error(`[updateModule Error for ID ${moduleId}]`, err);
    throw err;
  }
}

// backwards-compat alias if something still imports this name
export const updateModuleTranscriptAndQuiz = (moduleId, payload) =>
  updateModule(moduleId, payload);

/** Delete a module by ID */
export async function deleteModule(moduleId) {
  try {
    const { data } = await api.delete(`/modules/${moduleId}`);
    return data;
  } catch (err) {
    console.error(`[deleteModule Error for ID ${moduleId}]`, err);
    throw err;
  }
}

  // ✅ Add this to services/modules.js
  export async function deleteModuleById(moduleId) {
    try {
      const res = await api.delete(`/modules/${moduleId}`);
      return res.data;
    } catch (err) {
      console.error(`[deleteModuleById Error for ID ${moduleId}]`, err);
      throw err;
    }
  }