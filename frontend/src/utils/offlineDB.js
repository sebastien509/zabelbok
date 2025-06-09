import { getAllCourses, getCourseDetails } from '@/services/courses';

const DB_NAME = 'EduPlatformOfflineDB';
const STORE_NAME = 'course_materials';

export const offlineDB = {
  async initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('courseId', 'courseId', { unique: false });
        }
      };
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  },

  async addItem(item) {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(item); // overwrite if exists
        resolve(true);
      };
      request.onerror = () => resolve(false);
    });
  },

  async getItems(type) {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.error(`❌ Object store '${STORE_NAME}' not found.`);
          return resolve([]);
        }
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('type');
        const req = index.getAll(type);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    });
  },

  async deleteItem(id) {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        resolve(true);
      };
      request.onerror = () => resolve(false);
    });
  },

  async syncAllUserCoursesToOffline() {
    try {
      const { data: courses } = await getAllCourses();
      for (const course of courses) {
        const { data: fullCourse } = await getCourseDetails(course.id);

        const base = {
          courseId: course.id,
          downloadedAt: new Date().toISOString()
        };

        for (const book of fullCourse.books || []) {
          await offlineDB.addItem({
            ...book,
            ...base,
            type: 'book'
          });
        }

        for (const lecture of fullCourse.lectures || []) {
          await offlineDB.addItem({
            ...lecture,
            ...base,
            type: 'lecture'
          });
        }

        for (const exercise of fullCourse.exercises || []) {
          await offlineDB.addItem({
            ...exercise,
            ...base,
            type: 'exercise'
          });
        }

        for (const quiz of fullCourse.quizzes || []) {
          await offlineDB.addItem({
            ...quiz,
            ...base,
            type: 'quiz'
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to sync user courses:', error);
      return { success: false, error: error.message };
    }
  }
};
