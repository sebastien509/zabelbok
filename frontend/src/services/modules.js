// services/modules.js
import api from './api';

// Create new module (instant upload + review)
export async function createModule(moduleData) {
  try {
    const res = await api.post('/upload/module', moduleData);
    return res.data;
  } catch (err) {
    console.error('[createModule Error]', err);
    throw err;
  }
}

// Get all modules
export async function getAllModules() {
  try {
    const res = await api.get('/modules');
    return res.data;
  } catch (err) {
    console.error('[getAllModules Error]', err);
    return [];
  }
}

// Get module by ID
export async function getModuleById(id) {
  try {
    const res = await api.get(`/modules/${id}`);
    return res.data;
  } catch (err) {
    console.error(`[getModuleById Error for ID ${id}]`, err);
    return null;
  }
}

// Publish reviewed module with transcript and quiz
export async function publishReviewedModule(data) {
  try {
    const res = await api.post('/upload/publish', data);
    return res.data;
  } catch (err) {
    console.error('[publishReviewedModule Error]', err);
    throw err;
  }
}

export const updateModuleTranscriptAndQuiz = (moduleId, payload) =>
    api.put(`/modules/${moduleId}`, payload);

// Delete a module by ID (used for last-module deletion only)
export async function deleteModule(id) {
    try {
      const res = await api.delete(`/modules/${id}`);
      return res.data;
    } catch (err) {
      console.error(`[deleteModule Error for ID ${id}]`, err);
      throw err;
    }
  }
  

  // ✅ Add this to services/modules.js
export async function getModulesByCourse(courseId) {
    try {
      const res = await api.get(`/modules/course/${courseId}`);
      return res.data;
    } catch (err) {
      console.error(`[getModulesByCourse Error for course ${courseId}]`, err);
      return [];
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
  


  // frontend/src/services/modules.js



export async function getModulesByCourse(courseId) {
  return api(`/courses/${courseId}/modules`, { method: 'GET' }); // assumes you already have this route
}

/**
 * Step 2 (process before review):
 * Returns { transcript, quiz_questions, caption_url, duration_sec, language }
 */
export async function createModule(payload) {
  // payload: { title, description, course_id, order, created_at, video_url }
  return api('/modules/process', { method: 'POST', body: payload });
}

/**
 * Step 3 (publish after review):
 * Returns the saved module (your to_dict shape)
 */
export async function publishReviewedModule(payload) {
  // payload: { ...module, transcript, quiz, caption_url? }
  return api('/modules/publish', { method: 'POST', body: payload });
}
