import localforage from "localforage";

const UserDB = localforage.createInstance({
  name: "EstratejiUserDB",
  storeName: "user",
});

export async function saveMe(me) {
  if (!me) return;
  await UserDB.setItem("me", me);
}

export async function getMeOffline() {
  return await UserDB.getItem("me");
}

/**
 * In your backend, /enrollments/me returns *enrolled courses list*.
 * So this stores an array of course objects.
 */
export async function saveEnrollments(enrolledCourses = []) {
  await UserDB.setItem("enrolled_courses", enrolledCourses);
}

export async function getEnrollmentsOffline() {
  return (await UserDB.getItem("enrolled_courses")) || [];
}
