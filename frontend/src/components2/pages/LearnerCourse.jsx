// LearnerCourse.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getCourseBundleMeta } from "@/services/courses";
import { saveCourseBundleMeta, getCourseBundle } from "@/utils/cDB";
import { ModuleDB } from "@/utils/ModuleDB";
import { ModuleStateManager } from "@/utils/moduleStateManager";

import { Progress } from "@/components2/ui/progress";
import { Button } from "@/components2/ui/button";
import { toast } from "@/components2/ui/use-toast";

import {
  Download,
  Lock,
  CheckCircle2,
  Play,
  Pause,
  Clock,
  ArrowLeft,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { prefetchModules } from "@/utils/prefetchModules";
import { renderThumbnail } from "@/utils/renderThumbnail";

const unwrapAxios = (res) => res?.data ?? res;

const safeText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // Avoid React child crash (objects like {title, description})
  try {
    return v?.description || v?.message || v?.title || JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const getErrText = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  const axiosData = err?.response?.data;
  if (axiosData) {
    // common shapes
    return (
      safeText(axiosData?.description) ||
      safeText(axiosData?.message) ||
      safeText(axiosData?.title) ||
      safeText(axiosData) ||
      fallback
    );
  }
  return safeText(err?.message) || safeText(err) || fallback;
};

function normalizeCourse(courseLike, fallbackId) {
  const raw = unwrapAxios(courseLike);
  const course = raw?.course ?? raw;
  if (!course) return null;
  const cid = course.id ?? course.course_id ?? fallbackId;
  return { ...course, id: Number(cid) };
}

function normalizeBundle(bundleLike, fallbackId) {
  const raw = unwrapAxios(bundleLike);
  if (!raw) return { course: null, modules: [] };

  // 1) { course, modules }
  if (raw.course && Array.isArray(raw.modules)) {
    return {
      course: normalizeCourse(raw.course, fallbackId),
      modules: raw.modules || [],
    };
  }

  // 2) { ...course, modules: [...] }
  const course = normalizeCourse(raw, fallbackId);
  const modules = Array.isArray(raw.modules) ? raw.modules : [];
  return { course, modules };
}

export default function LearnerCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [offlineSaved, setOfflineSaved] = useState([]);
  const [loadingModuleId, setLoadingModuleId] = useState(null);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    const onStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", onStatus);
    window.addEventListener("offline", onStatus);
    return () => {
      window.removeEventListener("online", onStatus);
      window.removeEventListener("offline", onStatus);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let loadedCourse = null;
        let loadedModules = [];

        if (navigator.onLine) {
          // optional cleanup+sync
          await ModuleStateManager.cleanupExpiredIfOnline({ ttlHours: 24 });
          await ModuleStateManager.syncAllCompleted();

          const bundle = await getCourseBundleMeta(courseId);
          const norm = normalizeBundle(bundle, courseId);

          loadedCourse = norm.course;
          loadedModules = norm.modules || [];

          if (loadedCourse?.id) {
            await saveCourseBundleMeta(loadedCourse, loadedModules);
          }

          // prefetch next 2 module blobs/meta
          prefetchModules(loadedModules, 2);
        } else {
          // Offline bundle from cDB
          const bundle = await getCourseBundle(courseId);
          if (!bundle) throw new Error("Course not available offline");

          const norm = normalizeBundle(bundle, courseId);
          loadedCourse = norm.course;
          loadedModules =
            Array.isArray(norm.modules) && norm.modules.length > 0
              ? norm.modules
              : await ModuleDB.getCourseModules(courseId);
        }

        setCourse(loadedCourse);
        setModules(loadedModules);

        // completed map
        const completedMap = await ModuleStateManager.getCompletedMap();
        const courseModuleIds = loadedModules.map((m) => Number(m.id));
        setCompleted(courseModuleIds.filter((mid) => completedMap[String(mid)]));

        // offline saved ids
        const saved = [];
        await Promise.all(
          loadedModules.map(async (m) => {
            if (await ModuleDB.hasBlob(m.id)) saved.push(Number(m.id));
          })
        );
        setOfflineSaved(saved);

        // statuses
        const newStatus = {};
        await Promise.all(
          loadedModules.map(async (m) => {
            try {
              const status = await ModuleStateManager.getModuleStatus(m.id, loadedModules);
              // If status is accidentally an object, coerce to string-safe fallback
              newStatus[m.id] = typeof status === "string" ? status : "start";
            } catch {
              newStatus[m.id] = "start";
            }
          })
        );
        setStatusMap(newStatus);
      } catch (err) {
        console.error("[LearnerCourse] Error:", err);
        toast(
        "Error",
        {description: getErrText(err, "Failed to load course data (offline?)"),
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [courseId]);

  const percentage = modules.length
    ? Math.floor((completed.length / modules.length) * 100)
    : 0;

  const filteredModules = modules.filter(
    (m) => !showOfflineOnly || offlineSaved.includes(Number(m.id))
  );

  const handleOpenModule = async (mod, isLocked) => {
    if (isLocked) {
      toast(
     "Locked",
     { description: "Complete previous modules to unlock this one.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Critical fix: if offline, block navigation unless module is saved offline
    if (!navigator.onLine) {
      const has = await ModuleDB.hasBlob(mod.id).catch(() => false);
      if (!has) {
        toast(
     "Unavailable Offline",
     {description: "This module isn’t saved for offline use yet. Go online and tap “Save Offline”.",
          variant: "destructive",
        });
        return;
      }
    }

    navigate(`/modules/${mod.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {safeText(course?.title) || "Loading Course..."}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {safeText(course?.description) || "Course description"}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" /> Your Progress
          </h2>

          <Button
            variant={showOfflineOnly ? "default" : "outline"}
            onClick={() => {
              if (isLocked) return;
            
              const saved = offlineSaved.includes(Number(mod.id));
              if (!navigator.onLine && !saved) {
                toast(
                 "Not Available Offline",
                 {description: "Save this module while online to access it offline.",
                  variant: "destructive",
                });
                return;
              }
            
              navigate(`/modules/${mod.id}`);
            }}
                        className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {showOfflineOnly ? "Show All" : "Offline Only"}
          </Button>
        </div>

        <Progress value={percentage} className="h-3 bg-gray-200" />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>
            {completed.length} of {modules.length} completed
          </span>
          <span>{percentage}%</span>
        </div>

        {!isOnline && (
          <div className="mt-3 text-xs text-gray-500">
            You’re offline — downloads & progress are saved locally.
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((mod) => {
          const status = statusMap[mod.id];
          const isLocked = status === "locked";

          const statusDisplay =
            {
              completed: {
                text: "Completed",
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                color: "text-green-600",
                bgColor: "bg-green-50",
              },
              resume: {
                text: "Resume",
                icon: <Pause className="h-4 w-4 text-yellow-500" />,
                color: "text-yellow-600",
                bgColor: "bg-yellow-50",
              },
              start: {
                text: "Start",
                icon: <Play className="h-4 w-4 text-blue-500" />,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              locked: {
                text: "Locked",
                icon: <Lock className="h-4 w-4 text-gray-500" />,
                color: "text-gray-500",
                bgColor: "bg-gray-50",
              },
            }[status] || {
              text: "Start",
              icon: <Play className="h-4 w-4 text-blue-500" />,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            };

          const offlineAvailable = offlineSaved.includes(Number(mod.id));

          return (
            <motion.div
              key={mod.id}
              whileHover={{ y: -4 }}
              className={`relative border rounded-xl shadow-sm overflow-hidden bg-white group ${
                isLocked ? "opacity-90" : "hover:shadow-md cursor-pointer"
              }`}
              onClick={() => handleOpenModule(mod, isLocked)}
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden z-20">
                {renderThumbnail(mod, offlineSaved)}
              </div>

              <div className="p-4 relative z-20">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {safeText(mod.title)}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}
                  >
                    {statusDisplay.icon}
                    <span>{safeText(statusDisplay.text)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {safeText(mod.description)}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{safeText(mod.duration || 5)} min</span>
                  </div>
                </div>
              </div>

              {!isLocked && (
                <div className="px-4 pb-4 space-y-2">
                  {(status === "start" || status === "resume") && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-blue-300"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleOpenModule(mod, false);
                      }}
                    >
                      {status === "resume" ? "Resume Module" : "Start Module"}
                    </Button>
                  )}

                  {!offlineAvailable && isOnline && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingModuleId === mod.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setLoadingModuleId(mod.id);

                        try {
                          const res = await ModuleStateManager.saveModuleOffline(mod);
                          const success = !!res?.success;

                          if (success) {
                            toast(
                               "Saved Offline",
                               { description: `${safeText(mod.title)} is now available offline.`,
                            });
                            setOfflineSaved((prev) => [...prev, Number(mod.id)]);
                          } else {
                            toast(
                             "Error",
                             { description: safeText(res?.error || "Failed to save module offline"),
                              variant: "destructive",
                            });
                          }
                        } catch (err) {
                          toast(
                          "Error",
                          {description: getErrText(err, "Failed to save module offline"),
                            variant: "destructive",
                          });
                        } finally {
                          setLoadingModuleId(null);
                        }
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Save Offline
                    </Button>
                  )}

                  {offlineAvailable && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      ✅ Saved offline (persists after restart)
                    </div>
                  )}

                  {/* If offline but not available, show a hint instead of crashing later */}
                  {!isOnline && !offlineAvailable && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ Not saved offline — go online to download this module.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Back */}
      <div className="hidden md:flex absolute top-6 left-6 z-50 group">
        <div className="group-hover:grid relative w-full bg-white text-blue-500 border border-blue-500 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-all duration-200 animate-pulse items-center gap-2">
          <ArrowLeft size={16} className="animate-pulse" />
          <button onClick={() => (window.location.href = "/learner/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}
