import localforage from 'localforage';

// Create a new localforage instance for course storage
export const CourseDB = localforage.createInstance({
  name: 'EstratejiCourseDB',
  storeName: 'courses'
});

// Save a course object (by ID)
export async function save(course) {
  if (!course?.id) throw new Error('[CourseDB] Course must have an ID');
  try {
    await CourseDB.setItem(String(course.id), course);
  } catch (err) {
    console.error('[CourseDB] Failed to save course:', err);
  }
}

// Get a single course by ID
export async function get(id) {
  try {
    const course = await CourseDB.getItem(String(id));
    return course;
  } catch (err) {
    console.error('[CourseDB] Failed to get course:', err);
    return null;
  }
}

// Get all saved courses
export async function getAll() {
  const courses = [];
  try {
    await CourseDB.iterate((value) => {
      courses.push(value);
    });
  } catch (err) {
    console.error('[CourseDB] Failed to get all courses:', err);
  }
  return courses;
}

// Optional: Delete a course by ID
export async function remove(id) {
  try {
    await CourseDB.removeItem(String(id));
  } catch (err) {
    console.error('[CourseDB] Failed to remove course:', err);
  }
}

// Optional: Clear all stored courses
export async function clearAll() {
  try {
    await CourseDB.clear();
  } catch (err) {
    console.error('[CourseDB] Failed to clear all courses:', err);
  }
}
