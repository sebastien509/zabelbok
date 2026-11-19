import React, { useEffect, useMemo, useState } from "react";
import { getUserCourses, getMe } from "@/services/auth";
import { useSearchParams } from "react-router-dom";
import { deleteCourse } from "@/services/courses";
import { useAuth } from "@/AuthContext";
import CreatorSidebar from "../CreatorSidebar";
import CreatorCustomizeModal from "../CreatorCustomizeModal";
import CreatorCourseCard from "../CreatorCourseCard";
import { toast } from '@/components2/ui/use-toast';
import { Button } from "@/components2/ui/button";
import {
  Loader2,
  BookOpen,
  PlusCircle,
  BarChart2,
  User,
  Menu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isPublished = (c) => {
  // supports many shapes
  if (typeof c?.published === "boolean") return c.published;
  const st = String(c?.status || "").toLowerCase();
  if (st.includes("publish")) return true;
  if (st.includes("draft")) return false;
  // fallback: if it has published_at, assume published
  if (c?.published_at) return true;
  return false;
};



export default function CreatorDashboard() {
  const { logout } = useAuth() || {};
  const [courses, setCourses] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  const [needsCustomization, setNeedsCustomization] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeModal, setActiveModal] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const open = searchParams.get("open");
    const openCourse = searchParams.get("openCourse");
  
    if (open === "new-course") setActiveModal("new-course");
    if (openCourse) setActiveModal(`manage-${openCourse}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [meRes, coursesRes] = await Promise.all([getMe(), getUserCourses()]);

        const meUser = meRes?.user || meRes;
        const courseList = toArray(coursesRes);

        setCreator(meUser);
        setCourses(courseList);

        // If you want to re-enable auto-prompt customization:
        // const hasStyle = !!(meUser?.theme && meUser?.banner_url);
        // setNeedsCustomization(!hasStyle);
      } catch (err) {
        console.error("Failed to load creator dashboard:", err);
        if (err?.response?.status === 401) {
          logout?.();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [refreshKey, logout, navigate]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(isPublished).length;
    const draftCourses = totalCourses - publishedCourses;

    const totalStudents = courses.reduce(
      (acc, c) => acc + Number(c.student_count || c.enrollment_count || 0),
      0
    );

    const totalModules = courses.reduce(
      (acc, c) => acc + Number(c.module_count || c.modules?.length || 0),
      0
    );

    const avgLearners = totalCourses ? Math.round(totalStudents / totalCourses) : 0;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalModules,
      avgLearners,
    };
  }, [courses]);

  const topCourse = useMemo(() => {
    return [...courses]
      .sort(
        (a, b) =>
          Number(b.student_count || b.enrollment_count || 0) -
          Number(a.student_count || a.enrollment_count || 0)
      )[0];
  }, [courses]);

  const newestCourse = useMemo(() => {
    return [...courses]
      .sort((a, b) => {
        const da = safeDate(a.created_at) || safeDate(a.published_at) || safeDate(a.updated_at) || new Date(0);
        const db = safeDate(b.created_at) || safeDate(b.published_at) || safeDate(b.updated_at) || new Date(0);
        return db - da;
      })[0];
  }, [courses]);

  const handleCustomizationComplete = () => {
    setNeedsCustomization(false);
    setRefreshKey((p) => p + 1);
  };
  const handleDeleteCourse = async (course) => {
    if (!course?.id) return;

    const ok = confirm(`Delete "${course.title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await deleteCourse(course.id);

      toast("Deleted", { description: `"${course.title}" was deleted.` });

      // ✅ Optimistic remove (fast UI)
      setCourses((prev) => prev.filter((c) => c.id !== course.id));

      // ✅ Optional: also refetch to stay consistent
      // await fetchCourses();
    } catch (e) {
      console.error(e);
      toast("Error", {
        description:
          e?.response?.data?.error ||
          e?.message ||
          "Failed to delete course. Please try again.",
      });
    }
  };

  const handleLogout = () => {
    logout?.();
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C365E] mx-auto mb-2" />
          <p className="text-[#222222] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] text-[#222222] relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/80 backdrop-blur-md border border-[#EA7125]/20 shadow-sm"
      >
        <Menu className="h-5 w-5 text-[#EA7125]" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block ">
        <CreatorSidebar
          onCustomize={() => setNeedsCustomization(true)}
          onRefresh={() => setRefreshKey((p) => p + 1)}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          courses={courses}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl md:hidden"
            >
              <CreatorSidebar
                onCustomize={() => {
                  setNeedsCustomization(true);
                  setMobileSidebarOpen(false);
                }}
                onRefresh={() => setRefreshKey((p) => p + 1)}
                activeModal={activeModal}
                setActiveModal={(modal) => {
                  setActiveModal(modal);
                  setMobileSidebarOpen(false);
                }}
                courses={courses}
                onLogout={handleLogout}
                mobileClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 lg:p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#EA7125]/10">
                <Sparkles className="h-5 w-5 text-[#EA7125]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome, {creator?.full_name || "Creator"}
              </h1>
            </div>
            <p className="text-sm text-[#2C365E] mt-1">
              Manage your courses and track real performance from your live data.
            </p>
          </div>
                  <Button
          variant="outline"
          onClick={() => navigate("/creator/revenue")}
          className="flex-1 md:flex-none bg-white/80 backdrop-blur-md border-[#2C365E]/20 hover:bg-[#2C365E]/10 hover:border-[#2C365E]/30"
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Revenue & Analytics
        </Button>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setNeedsCustomization(true)}
              className="flex-1 md:flex-none bg-white/80 backdrop-blur-md border-[#EA7125]/20 hover:bg-[#EA7125]/10 hover:border-[#EA7125]/30"
            >
              Edit Page Style
            </Button>

            <Button className="flex-1 md:flex-none bg-[#EA7125] hover:bg-[#EA7125]/90" asChild>
              <a href={`/${creator?.slug || ""}`} target="_blank" rel="noopener noreferrer">
                View My Page <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Real Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -4 }} className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#EA7125]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#EA7125]/10">
                <BookOpen className="h-5 w-5 text-[#EA7125]" />
              </div>
              <h3 className="text-sm font-semibold text-[#2C365E]">Courses</h3>
            </div>
            <p className="text-3xl font-bold text-[#222222]">{stats.totalCourses}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">
              {stats.publishedCourses} published • {stats.draftCourses} drafts
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#66A569]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#66A569]/10">
                <User className="h-5 w-5 text-[#66A569]" />
              </div>
              <h3 className="text-sm font-semibold text-[#2C365E]">Learners</h3>
            </div>
            <p className="text-3xl font-bold text-[#222222]">{stats.totalStudents}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">Total enrolled across your courses</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#2C365E]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#2C365E]/10">
                <ClipboardList className="h-5 w-5 text-[#2C365E]" />
              </div>
              <h3 className="text-sm font-semibold text-[#2C365E]">Modules</h3>
            </div>
            <p className="text-3xl font-bold text-[#222222]">{stats.totalModules}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">Total modules you’ve created</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#7C3AED]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#7C3AED]/10">
                <BarChart2 className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <h3 className="text-sm font-semibold text-[#2C365E]">Avg Learners</h3>
            </div>
            <p className="text-3xl font-bold text-[#222222]">{stats.avgLearners}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">Average learners per course</p>
          </motion.div>
        </div>

        {/* Insights (real, derived) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-[#66A569]" />
              <h3 className="font-semibold text-[#2C365E]">Top Course</h3>
            </div>
            {topCourse ? (
              <>
                <p className="font-bold text-[#222222] line-clamp-1">{topCourse.title}</p>
                <p className="text-xs text-[#2C365E]/70 mt-1">
                  {(topCourse.student_count || topCourse.enrollment_count || 0)} learners •{" "}
                  {topCourse.module_count || topCourse.modules?.length || 0} modules
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setActiveModal(`manage-${topCourse.id}`)}
                >
                  Open Course
                </Button>
              </>
            ) : (
              <p className="text-sm text-[#2C365E]/70">No courses yet.</p>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="h-5 w-5 text-[#EA7125]" />
              <h3 className="font-semibold text-[#2C365E]">Newest Course</h3>
            </div>
            {newestCourse ? (
              <>
                <p className="font-bold text-[#222222] line-clamp-1">{newestCourse.title}</p>
                <p className="text-xs text-[#2C365E]/70 mt-1">
                  Status: {isPublished(newestCourse) ? "Published" : "Draft"}
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setActiveModal(`manage-${newestCourse.id}`)}
                >
                  Continue Editing
                </Button>
              </>
            ) : (
              <p className="text-sm text-[#2C365E]/70">No courses yet.</p>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#7C3AED]" />
              <h3 className="font-semibold text-[#2C365E]">Next Actions</h3>
            </div>
            <ul className="text-sm text-[#2C365E]/80 space-y-2 mt-2">
              <li>• Publish drafts to appear in learner discovery</li>
              <li>• Add at least 1 module thumbnail per course</li>
              <li>• Create more modules to increase retention</li>
            </ul>
            <Button
              className="mt-3 w-full bg-[#EA7125] hover:bg-[#EA7125]/90"
              onClick={() => setActiveModal("new-course")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#2C365E]/10 p-2 rounded-lg text-[#2C365E]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">My Courses</h2>
                <p className="text-xs text-[#2C365E]/80">Manage your content</p>
              </div>
            </div>

            <Button
              className="gap-2 bg-[#EA7125] hover:bg-[#EA7125]/90 text-sm"
              onClick={() => setActiveModal("new-course")}
            >
              <PlusCircle className="h-4 w-4" />
              New Course
            </Button>
          </div>

          {courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/50 rounded-lg p-6 text-center border border-dashed border-[#EA7125]/30"
            >
              <BookOpen className="h-8 w-8 mx-auto text-[#2C365E]/30 mb-3" />
              <h3 className="text-base font-medium text-[#2C365E]">No courses yet</h3>
              <p className="text-xs text-[#2C365E]/60 mt-1 mb-4">
                Create your first course to start teaching.
              </p>
              <Button
                className="gap-2 bg-[#EA7125] hover:bg-[#EA7125]/90 text-sm"
                onClick={() => setActiveModal("new-course")}
              >
                <PlusCircle className="h-4 w-4" />
                Create Course
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course) => (
                <CreatorCourseCard
                  key={course.id}
                  course={course}
                  setActiveModal={setActiveModal}
                  onDeleteCourse={handleDeleteCourse} // ✅ pass it

                />
                

              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {needsCustomization && (
        <CreatorCustomizeModal
          open={needsCustomization}
          onClose={(openState) => setNeedsCustomization(openState)}
          onConfirm={handleCustomizationComplete}
        />
      )}
    </div>
  );
}
