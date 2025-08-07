import localforage from 'localforage';

export const CourseDB = localforage.createInstance({
  name: 'EstratejiCourseDB',
  storeName: 'courses'
});

export async function save(course) {
  if (!course?.id) throw new Error('[CourseDB] Course must have an ID');
  try {
    await CourseDB.setItem(String(course.id), course);
  } catch (err) {
    console.error('[CourseDB] Failed to save course:', err);
  }
}b  

export async function get(id) {
  try {
    return await CourseDB.getItem(String(id));
  } catch (err) {
    console.error('[CourseDB] Failed to get course:', err);
    return null;
  }
}

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

export async function remove(id) {
  try {
    await CourseDB.removeItem(String(id));
  } catch (err) {
    console.error('[CourseDB] Failed to remove course:', err);
  }
}

export async function clearAll() {
  try {
    await CourseDB.clear();
  } catch (err) {
    console.error('[CourseDB] Failed to clear all courses:', err);
  }
}
