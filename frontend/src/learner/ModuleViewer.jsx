// ModuleViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getModuleById } from "@/services/modules";
import { getCourseBundleMeta } from "@/services/courses";
import { getCourseBundle } from "@/utils/cDB";
import { ModuleDB } from "@/utils/ModuleDB";
import { saveCompletedOffline } from "@/components2/moduleSync";

import VideoPlayer from "./VideoPlayer";
import QuizViewerModal from "@/components2/QuizViewerModal";
import ReviewTranscriptModal from "@/components2/ReviewTranscriptModal";
import { Button } from "@/components2/ui/button";
import { motion } from "framer-motion";
import ModuleProgressLottie from "@/components2/ui/ModuleProgressLottie";
import { toast } from "@/components2/ui/use-toast";
import { ChevronRight, BookOpen, CheckCircle } from "lucide-react";
import VideoTranscript from "./VideoTranscript";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components2/ui/dialog";

const unwrapAxios = (res) => res?.data ?? res;

const safeText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
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

function normalizeBundle(bundleLike) {
  const raw = unwrapAxios(bundleLike);
  if (!raw) return { course: null, modules: [] };

  if (raw.course && Array.isArray(raw.modules)) return raw;
  if (Array.isArray(raw.modules)) return { course: raw, modules: raw.modules };

  return { course: raw, modules: [] };
}

export default function ModuleViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);

  const [courseModules, setCourseModules] = useState([]);

  const [videoSrc, setVideoSrc] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [nextModule, setNextModule] = useState(null);
  const [nextAvailableOffline, setNextAvailableOffline] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const checkStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", checkStatus);
    window.addEventListener("offline", checkStatus);
    return () => {
      window.removeEventListener("online", checkStatus);
      window.removeEventListener("offline", checkStatus);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const moduleId = Number(id);

        // 1) Try offline DB first
        let mod = await ModuleDB.get(moduleId);

        // 2) If missing blob/meta, fetch from API (online only)
        if (!mod || (!mod.blob && !mod.video_url)) {
          if (!navigator.onLine) throw new Error("Module not available offline");
          const apiRes = await getModuleById(id);
          mod = unwrapAxios(apiRes);
        }

        setModule(mod);

        // video src
        if (mod?.blob) setVideoSrc(URL.createObjectURL(mod.blob));
        else setVideoSrc(mod?.video_url || "");

        // 3) Load course module list (for Next Module)
        const cid = Number(mod.course_id);
        let modulesList = [];

        if (!navigator.onLine) {
          const offlineBundle = await getCourseBundle(cid);
          const norm = normalizeBundle(offlineBundle);
          modulesList = norm.modules || [];
        } else {
          const onlineBundle = await getCourseBundleMeta(cid);
          const norm = normalizeBundle(onlineBundle);
          modulesList = norm.modules || [];
        }

        setCourseModules(Array.isArray(modulesList) ? modulesList : []);
      } catch (err) {
        console.error("[ModuleViewer] Load error:", err);
        toast(
     "Error loading module",
     {description: getErrText(err, "Failed to load module"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const determineNextModule = async () => {
      if (!module || !Array.isArray(courseModules) || courseModules.length === 0) return;

      const modulesSorted = [...courseModules].sort(
        (a, b) => Number(a.order || 0) - Number(b.order || 0)
      );

      const index = modulesSorted.findIndex((m) => Number(m.id) === Number(module.id));
      const next = index >= 0 ? modulesSorted[index + 1] : null;

      if (next) {
        setNextModule(next);

        if (isOffline) {
          const nextExists = await ModuleDB.get(Number(next.id));
          setNextAvailableOffline(!!nextExists);
        } else {
          setNextAvailableOffline(true);
        }
      } else {
        setNextModule(null);
        setNextAvailableOffline(false);
      }
    };

    determineNextModule();
  }, [module, courseModules, isOffline]);

  const handleMarkAllCompleted = async () => {
    if (!Array.isArray(courseModules) || courseModules.length === 0) return;
    for (const mod of courseModules) {
      await ModuleDB.markCompleted(mod.id);
      await saveCompletedOffline(mod.id);
      localStorage.removeItem(`module-progress-${mod.id}`);
    }
  };

  const handleComplete = async () => {
    await handleMarkAllCompleted();
    setShowCongrats(true);
  };

  const handleNext = async () => {
    // mark current completed
    await ModuleDB.markCompleted(module.id);
    await saveCompletedOffline(module.id);
    localStorage.removeItem(`module-progress-${module.id}`);

    if (!nextModule) {
      await handleComplete();
      return;
    }

    if (isOffline && !nextAvailableOffline) {
      toast(
       "Next Module Unavailable Offline",
       {description:
          "You’re offline and the next module isn’t saved. Go online and save it first.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/modules/${nextModule.id}`);
  };

  const handleProgressUpdate = async (value) => {
    setProgress(value);
    localStorage.setItem(`module-progress-${module.id}`, value);
    await ModuleDB.updateMeta(module.id, { resume_progress: value });
  };

  const handleTimeUpdate = async (time) => {
    setCurrentTime(time);
    await ModuleDB.updateMeta(module.id, { resume_time: time });
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">Loading...</div>
  ) : (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <ModuleProgressLottie progress={progress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <VideoPlayer
              ref={videoRef}
              src={videoSrc}
              moduleId={module.id}
              onEnded={() => {
                if (module?.quiz?.questions?.length > 0) setShowQuiz(true);
                else setShowNext(true);
              }}
              onProgress={handleProgressUpdate}
              onDurationChange={setDuration}
              onTimeUpdate={handleTimeUpdate}
              aspectRatio="16/9"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h1 className="text-2xl font-bold mb-2">{safeText(module?.title)}</h1>
            <p className="text-sm text-gray-600 mb-2">{safeText(module?.description)}</p>

            <Button
              variant="outline"
              onClick={() => setShowTranscriptModal(true)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View Transcript
            </Button>

            {showNext && (
              <Button
                onClick={handleNext}
                className={`mt-4 w-full flex gap-2 ${
                  nextModule
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {nextModule ? (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Next Module
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Course
                  </>
                )}
              </Button>
            )}

            {isOffline && (
              <div className="mt-3 text-xs text-gray-500">
                Offline mode — next module requires being saved offline.
              </div>
            )}
          </div>

          <VideoTranscript
            transcript={module?.transcript}
            currentTime={currentTime}
            duration={duration}
            onSeek={(time) => videoRef.current?.seekTo?.(time)}
          />
        </div>
      </div>

      {module?.quiz?.questions?.length > 0 && (
        <QuizViewerModal
          quiz={module.quiz}
          open={showQuiz}
          onClose={() => setShowQuiz(false)}
          onSuccess={() => {
            setShowNext(true);
            toast( "Quiz Passed!",{ description: "Proceed to next module" });
          }}
        />
      )}

      <ReviewTranscriptModal
        transcript={module?.transcript}
        open={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
      />

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-700">🎉 Congratulations!</DialogTitle>
            <p className="text-sm text-gray-600">You've completed the course. Great job!</p>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-4">
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
            <Button
              onClick={() => navigate(`/learner/courses/${module?.course_id}`)}
              variant="outline"
              className="w-full"
            >
              Go to Course Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
