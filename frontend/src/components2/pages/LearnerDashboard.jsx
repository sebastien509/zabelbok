// LearnerDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMe, getAllCreators } from "@/services/auth";
import { getMyEnrollments, finalizePaidEnrollment } from "@/services/enrollments";
import { getCoursesBySchool, getCourseBundleMeta } from "@/services/courses";

import CourseCard from "@/components2/CourseCard";
import CreatorCard from "../CreatorCard";
import { Button } from "@/components2/ui/button";

import { saveMe, saveEnrollments } from "@/utils/userDB";
import {
  getAll as getAllCoursesOffline,
  save as saveCourse,
  saveCourseBundleMeta,
  getCourseBundle,
} from "@/utils/cDB";

import { ModuleStateManager } from "@/utils/moduleStateManager";

import {
  Loader2,
  BookOpen,
  Users2,
  Trophy,
  Sparkles,
  Flame,
  LogOut,
  ArrowRight,
  TrendingUp,
  CalendarClock,
} from "lucide-react";

// ---------------- Helpers ----------------
const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getCourseIdFromEnrollment = (e) =>
  Number(e?.course_id ?? e?.course?.id ?? e?.course?.course_id ?? 0) || null;

export default function LearnerDashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [schoolCourses, setSchoolCourses] = useState([]);
  const [creators, setCreators] = useState([]);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);

  // ---------------------------------------
  // Stripe success finalize
  // ---------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const courseId = params.get("course_id");
    const payment = params.get("payment");

    if (payment === "success" && sessionId && courseId) {
      finalizePaidEnrollment(Number(courseId), sessionId)
        .then(() => {
          window.history.replaceState({}, "", "/dashboard");
          window.location.reload();
        })
        .catch(() => {});
    }
  }, []);

  // ---------------------------------------
  // Main fetch
  // ---------------------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const isOnline = navigator.onLine;

        // ---------------- OFFLINE ----------------
        if (!isOnline) {
          const cachedCourses = await getAllCoursesOffline();

          // best-effort from localStorage (won't crash if empty)
          const meLocal = JSON.parse(localStorage.getItem("user") || "null");
          const enrollLocal = JSON.parse(localStorage.getItem("enrollments") || "[]");

          if (meLocal) setMe(meLocal);

          const enrollments = toArray(enrollLocal);
          setEnrollmentsData(enrollments);

          const enrolledIds = Array.from(
            new Set(enrollments.map(getCourseIdFromEnrollment).filter(Boolean))
          );
          setEnrolledCourseIds(enrolledIds);

          // enrich cached course list with module_count from bundle if present
          const enrichedOffline = await Promise.all(
            (Array.isArray(cachedCourses) ? cachedCourses : []).map(async (c) => {
              const cid = Number(c?.id);
              if (!cid) return c;

              const bundle = await getCourseBundle(cid).catch(() => null);
              const module_count =
                Number(c?.module_count || 0) || Number(bundle?.modules?.length || 0);

              return { ...c, id: cid, module_count };
            })
          );

          setSchoolCourses(enrichedOffline);

          // creators are optional offline
          setCreators([]);
          return;
        }

        // ---------------- ONLINE ----------------
        // 1) getMe first (so we can use real school_id)
        const meRes = await getMe().catch(() =>
          JSON.parse(localStorage.getItem("user") || "{}")
        );
        const meUser = meRes?.user || meRes;
        setMe(meUser);

        const schoolId = Number(meUser?.school_id || 0) || null;

        // 2) fetch rest in parallel
        const [myEnrollmentsRes, creatorsRes, schoolCoursesRes] = await Promise.all([
          getMyEnrollments().catch(() => ({ items: [] })),
          getAllCreators().catch(() => []),
          schoolId
            ? getCoursesBySchool(schoolId).catch(async () => await getAllCoursesOffline())
            : getAllCoursesOffline(),
        ]);

        // Enrollments shape: { items: [...] } OR []
        const enrollments = toArray(myEnrollmentsRes);

        const enrolledIds = Array.from(
          new Set(enrollments.map(getCourseIdFromEnrollment).filter(Boolean))
        );
        setEnrolledCourseIds(enrolledIds);

        // Courses catalog shape: { items, meta } OR []
        const courses = toArray(schoolCoursesRes);

        // set creators (supports {items} or [] or {creators})
        const creatorList = Array.isArray(creatorsRes)
          ? creatorsRes
          : Array.isArray(creatorsRes?.items)
            ? creatorsRes.items
            : Array.isArray(creatorsRes?.creators)
              ? creatorsRes.creators
              : [];
        setCreators(creatorList);

        // Cache user/enrollments (DB + localStorage)
        await saveMe(meUser);
        await saveEnrollments(enrollments);
        localStorage.setItem("user", JSON.stringify(meUser));
        localStorage.setItem("enrollments", JSON.stringify(enrollments));

        // Cache course list lightweight
        await Promise.allSettled(
          courses
            .filter((c) => c?.id)
            .map((c) => saveCourse({ ...c, id: Number(c.id) }))
        );

        // Warm-cache enrolled bundle meta first (so bundle exists for progress)
        const idsToCache = enrolledIds.slice(0, 12);
        await Promise.allSettled(
          idsToCache.map(async (courseId) => {
            try {
              const raw = await getCourseBundleMeta(courseId);
              const bundle = raw?.data ?? raw; // unwrap axios if needed
              const courseObj = bundle?.course || {};
              const modules = bundle?.modules || [];

              // (Optional best practice) store module_count into meta when saving:
              const normalizedCourse = {
                ...courseObj,
                id: Number(courseObj.id ?? courseId),
                module_count: Number(courseObj?.module_count || 0) || Number(modules?.length || 0),
              };

              await saveCourseBundleMeta(normalizedCourse, modules);
            } catch (e) {
              console.warn("bundle-meta cache failed for", courseId, e);
            }
          })
        );

        // Enrich catalog with module_count from cached bundle (if available)
        const enrichedCatalog = await Promise.all(
          courses.map(async (c) => {
            const cid = Number(c?.id);
            if (!cid) return c;

            const bundle = await getCourseBundle(cid).catch(() => null);
            const module_count =
              Number(c?.module_count || 0) ||
              Number(bundle?.course?.module_count || 0) ||
              Number(bundle?.modules?.length || 0);

            return { ...c, id: cid, module_count };
          })
        );
        setSchoolCourses(enrichedCatalog);

        // Compute progress (bundles now exist)
        const completedMap = await ModuleStateManager.getCompletedMap();
        const progressByCourse = new Map();

        await Promise.allSettled(
          enrolledIds.map(async (courseId) => {
            const bundle = await getCourseBundle(courseId).catch(() => null);
            const mods = bundle?.modules || [];
            if (!mods.length) return;

            const done = mods.filter((m) => completedMap[String(Number(m.id))]).length;
            const pct = Math.round((done / mods.length) * 100);

            progressByCourse.set(Number(courseId), pct);
          })
        );

        // Attach progress to enrollments (use helper for course id!)
        const enrollmentsWithProgress = enrollments.map((e) => {
          const cid = getCourseIdFromEnrollment(e);
          const derived = cid ? progressByCourse.get(cid) : null;
          if (derived == null) return e;
          return { ...e, progress_percent: derived };
        });

        setEnrollmentsData(enrollmentsWithProgress);
      } catch (err) {
        console.error("❌ LearnerDashboard failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------------------------------------
  // Derived
  // ---------------------------------------

  // ✅ FIX: merge module_count into enrolled courses using catalog (already enriched)
  const enrolledCoursesFromEnrollments = useMemo(() => {
    const catalogById = new Map(schoolCourses.map((c) => [Number(c.id), c]));

    const list = enrollmentsData
      .map((e) => e?.course)
      .filter(Boolean)
      .map((c) => {
        const id = Number(c.id);
        const fromCatalog = catalogById.get(id);

        return {
          ...c,
          id,
          module_count:
            Number(fromCatalog?.module_count || 0) ||
            Number(c?.module_count || 0) ||
            Number(fromCatalog?.modules?.length || 0) ||
            Number(c?.modules?.length || 0) ||
            0,
        };
      });

    return Array.from(new Map(list.map((c) => [c.id, c])).values());
  }, [enrollmentsData, schoolCourses]);

  const unenrolledCourses = useMemo(() => {
    const ids = new Set(enrolledCourseIds);
    return schoolCourses.filter((c) => !ids.has(Number(c.id)));
  }, [schoolCourses, enrolledCourseIds]);

  // ✅ New courses (last 14 days)
  const newCourses = useMemo(() => {
    const now = Date.now();
    const days14 = 14 * 24 * 60 * 60 * 1000;

    const sorted = [...unenrolledCourses].sort((a, b) => {
      const da = safeDate(a.created_at) || safeDate(a.published_at) || new Date(0);
      const db = safeDate(b.created_at) || safeDate(b.published_at) || new Date(0);
      return db - da;
    });

    const reallyNew = sorted.filter((c) => {
      const d = safeDate(c.created_at) || safeDate(c.published_at);
      return d ? now - d.getTime() <= days14 : false;
    });

    return (reallyNew.length ? reallyNew : sorted).slice(0, 6);
  }, [unenrolledCourses]);

  // ✅ Top courses by learners
  const topCourses = useMemo(() => {
    const score = (c) => Number(c.student_count || c.enrollment_count || c.learners || 0);

    return [...unenrolledCourses].sort((a, b) => score(b) - score(a)).slice(0, 6);
  }, [unenrolledCourses]);

  // ✅ Courses grouped by creator
  const coursesByCreator = useMemo(() => {
    const map = new Map();
    for (const c of schoolCourses) {
      const ownerId =
        Number(c.professor_id || c.creator_id || c.user_id || c.author_id) || null;
      if (!ownerId) continue;
      if (!map.has(ownerId)) map.set(ownerId, []);
      map.get(ownerId).push(c);
    }

    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        const da = safeDate(a.created_at) || safeDate(a.published_at) || new Date(0);
        const db = safeDate(b.created_at) || safeDate(b.published_at) || new Date(0);
        return db - da;
      });
      map.set(k, list);
    }

    return map;
  }, [schoolCourses]);

  // ✅ Top creators by course count
  const topCreators = useMemo(() => {
    const countFor = (creatorId) => (coursesByCreator.get(Number(creatorId)) || []).length;

    return [...creators]
      .map((cr) => ({ ...cr, _courseCount: countFor(cr.id) }))
      .sort((a, b) => (b._courseCount || 0) - (a._courseCount || 0))
      .slice(0, 6);
  }, [creators, coursesByCreator]);

  // ✅ Real stats
  const stats = useMemo(() => {
    const totalEnrolled = enrolledCourseIds.length;
    const completed = enrollmentsData.filter((e) => e.completed === true || !!e.completed_at).length;

    const activeCreators = Array.from(coursesByCreator.keys()).length;

    const now = Date.now();
    const days7 = 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = schoolCourses.filter((c) => {
      const d = safeDate(c.created_at) || safeDate(c.published_at);
      return d ? now - d.getTime() <= days7 : false;
    }).length;

    return { totalEnrolled, completed, activeCreators, newThisWeek };
  }, [enrolledCourseIds, enrollmentsData, coursesByCreator, schoolCourses]);

  const getEnrollmentData = (courseId) =>
    enrollmentsData.find((e) => getCourseIdFromEnrollment(e) === Number(courseId));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome{me?.full_name ? `, ${me.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Here are your courses, insights, and new learning opportunities.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2 border-gray-300 shadow-sm hover:shadow-md transition"
          onClick={() =>
            document.getElementById("explore-section")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Sparkles className="h-4 w-4" />
          Explore
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-50">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              Enrollments
            </span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-50">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
              Completed
            </span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Finished Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-50">
              <Users2 className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">
              Creators
            </span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Active Creators</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCreators}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-orange-50">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700">
              New
            </span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">New Courses (7d)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </span>
              My Courses
            </h2>
            <p className="text-sm text-gray-600 mt-1">Continue where you left off.</p>
          </div>
        </div>

        {enrolledCoursesFromEnrollments.length === 0 ? (
          <div className="mt-6 bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
            <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">No courses yet</h3>
            <p className="text-sm text-gray-600 mt-1">
              Explore the catalog and enroll in your first course.
            </p>
            <Button
              className="mt-5 gap-2 bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() =>
                document.getElementById("explore-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Sparkles className="h-4 w-4" />
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="mt-6 relative w-full overflow-x-auto">
            <div className="flex flex-nowrap space-x-4 pb-2">
              {enrolledCoursesFromEnrollments.map((course) => (
                <div key={course.id} className="w-[85vw] sm:w-[320px] max-w-[90vw] shrink-0">
                  <CourseCard
                    course={course}
                    enrolled={true}
                    enrollmentData={getEnrollmentData(course.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explore */}
      <div
        id="explore-section"
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="p-2 rounded-lg bg-gray-50">
                <Sparkles className="h-5 w-5 text-gray-900" />
              </span>
              Explore
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Discover creators and courses you haven’t enrolled in yet.
            </p>
          </div>
        </div>

        {/* Top Creators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Top Creators
            </h3>
          </div>

          {topCreators.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">No creators found right now.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  courses={coursesByCreator.get(Number(creator.id)) || creator.top_courses || []}
                  enrolledCourseIds={enrolledCourseIds}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Top Courses
            </h3>
          </div>

          {topCourses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">No courses available right now.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCourses.map((course) => (
                <CourseCard key={course.id} course={course} enrolled={false} />
              ))}
            </div>
          )}
        </div>

        {/* New Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-orange-600" />
              New Courses
            </h3>
          </div>

          {newCourses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">No new courses right now.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newCourses.map((course) => (
                <CourseCard key={course.id} course={course} enrolled={false} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout FAB */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div
          onClick={() => window.innerWidth < 768 && handleLogout()}
          className="bg-red-500 p-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 text-white" />
        </div>

        <div className="hidden group-hover:flex absolute bottom-0 right-0 mb-12 bg-white text-red-500 border border-red-500 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-200 items-center gap-2">
          <LogOut size={16} />
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="md:hidden mt-2 text-xs text-red-600 text-center">Tap to logout</div>
      </div>
    </div>
  );
}
