import { getAllCourses, getCourseDetails } from '@/services/courses';

const STORAGE_KEY = 'EduPlatformOfflineDB';

export const offlineDB = {
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { courses: {}, syncedAt: null };
    } catch (error) {
      console.error('[OfflineDB] Failed to load:', error);
      return { courses: {}, syncedAt: null };
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[OfflineDB] Saved successfully');
    } catch (error) {
      console.error('[OfflineDB] Failed to save:', error);
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[OfflineDB] Cleared');
  },

  getAllCourses() {
    const db = this.load();
    return Object.entries(db.courses).map(([id, course]) => ({
      id: Number(id),
      title: course.title
    }));
  },

  getCourse(courseId) {
    const db = this.load();
    console.log(db)

    return db.courses?.[courseId] || null;
  },

  getResources(courseId, type = null) {
    const course = this.getCourse(courseId);
    if (!course) return [];
    if (!type || type === 'all') {
      return [
        ...(course.books || []).map(b => ({ ...b, type: 'book' })),
        ...(course.lectures || []).map(l => ({ ...l, type: 'lecture' })),
        ...(course.exercises || []).map(e => ({ ...e, type: 'exercise' })),
        ...(course.quizzes || []).map(q => ({ ...q, type: 'quiz' }))
      ];
    }
    return (course[type + 's'] || []).map(r => ({ ...r, type }));
  },

  async syncAllUserCourses() {
    try {
      const { data: courses } = await getAllCourses();
      const db = {
        courses: {},
        syncedAt: new Date().toISOString()
      };
  
      for (const course of courses) {
        const { data: details } = await getCourseDetails(course.id);
        
        // 🧠 Fetch book blobs
      // In offlineDB.syncAllUserCourses()
const books = await Promise.all(
    (details.books || []).map(async (book) => {
      try {
        if (book.content_url) {
          const res = await fetch(book.content_url);
          const blob = await res.blob();
          return { 
            ...book, 
            blob,
            file_type: book.content_url.split('.').pop().toLowerCase() // Add file type
          };
        }
        return { ...book };
      } catch (err) {
        console.error('[SYNC] Failed to fetch book blob:', err);
        return { ...book };
      }
    })
  );
  
        db.courses[course.id] = {
          title: course.title,
          lectures: details.lectures || [],
          books, // ✅ now includes blobs
          exercises: details.exercises || [],
          quizzes: details.quizzes || []
        };
  
        console.log(`[SYNC] Stored course ${course.id}: ${course.title}`, details);
      }
  
      this.save(db);
      console.log('[SYNC] Offline data updated successfully');
      return db;
    } catch (error) {
      console.error('[SYNC] Failed to sync:', error);
      throw error;
    }
  }
  
};
