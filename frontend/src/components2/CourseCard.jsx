import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components2/ui/card";
import { Button } from "@/components2/ui/button";
import { Badge } from "@/components2/ui/badge";
import {
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Code,
  Cpu,
  Database,
  Server,
  Lock,
  Zap,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Eye,
  X,
  Loader2,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components2/ui/dialog";
import bgAnimation from "@/assets/bgAnimation.json";
import Lottie from "lottie-react";
import { renderThumbnail } from "@/utils/renderThumbnail";
import { enrollInCourse } from "@/services/enrollments";
import { toast } from "./ui/use-toast";

// ---------------------------
// Helpers
// ---------------------------
const formatPrice = (course) => {
  const isPaid = !!(course?.payments?.is_paid ?? course?.is_paid);
  const cents = Number(course?.payments?.price_cents ?? course?.price_cents ?? 0) || 0;
  const currency = (course?.payments?.currency ?? course?.currency ?? "usd").toUpperCase();
  if (!isPaid || cents === 0) return "FREE";
  return `${currency} ${(cents / 100).toFixed(2)}`;
};

const quantizeProgress = (rawPercent) => {
  const p = Math.max(0, Math.min(100, Number(rawPercent || 0)));
  if (p >= 100) return 100;
  if (p >= 90) return 90;
  if (p >= 60) return 60;
  if (p >= 30) return 30;
  return 0;
};

const progressMeta = (p) => {
  switch (p) {
    case 100:
      return { label: "Completed", icon: CheckCircle2, tone: "bg-green-600 text-white" };
    case 90:
      return { label: "90%", icon: BarChart3, tone: "bg-emerald-600 text-white" };
    case 60:
      return { label: "60%", icon: BarChart3, tone: "bg-blue-600 text-white" };
    case 30:
      return { label: "30%", icon: BarChart3, tone: "bg-purple-600 text-white" };
    default:
      return { label: "Not started", icon: PlayCircle, tone: "bg-gray-900 text-white" };
  }
};

// ---------------------------
// Preview Modal Component
// ---------------------------
function PreviewModal({ open, onClose, course, enrolled, onEnroll }) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onEnroll();
      onClose();
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPaid = !!(course?.payments?.is_paid ?? course?.is_paid);
  const priceCents = Number(course?.payments?.price_cents ?? course?.price_cents ?? 0) || 0;
  const isFree = !isPaid || priceCents === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Video Section */}
          <div className="aspect-video bg-black">
            {course?.intro_url ? (
              <iframe
                src={course.intro_url}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Course Introduction"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                <Video className="h-16 w-16 text-white/50 mb-4" />
                <p className="text-white/70 text-sm">No introduction video available</p>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{course?.title}</DialogTitle>
              <DialogDescription className="text-base mt-2">
                {course?.description || "No description provided"}
              </DialogDescription>
            </DialogHeader>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">
                    {course?.module_count || course?.modules?.length || 0}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Modules</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">{course?.student_count || 0}</span>
                </div>
                <span className="text-sm text-gray-600">Learners</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold">{course?.duration || "Self-paced"}</span>
                </div>
                <span className="text-sm text-gray-600">Duration</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={enrolled ? onClose : handleEnroll}
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-2">
                  {enrolled ? (
                    <>
                      Start Course <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : isFree ? (
                    <>
                      {loading ? "Enrolling..." : "Enroll Free"} 
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      {loading ? "Starting Checkout..." : "Unlock & Pay"} 
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------
// Main CourseCard Component
// ---------------------------
export default function CourseCard({
  course,
  enrolled = false,
  compact = false,
  enrollmentData = null,
}) {
  const navigate = useNavigate();
  const firstModule = course?.modules?.[0];
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const techIcons = [Code, Cpu, Database, Server];
  const TechIcon = useMemo(
    () => techIcons[Math.floor(Math.random() * techIcons.length)],
    []
  );

  const priceLabel = formatPrice(course);
  const isPaid = !!(course?.payments?.is_paid ?? course?.is_paid);
  const priceCents = Number(course?.payments?.price_cents ?? course?.price_cents ?? 0) || 0;
  const isFree = !isPaid || priceCents === 0;

  const handleOpen = () => navigate(`/learner/courses/${course.id}`);

  const rawProgress = useMemo(() => {
    if (!enrolled) return 0;
    if (enrollmentData?.completed === true || enrollmentData?.completed_at) return 100;
    
    const direct =
      enrollmentData?.progress_percent ??
      enrollmentData?.progress ??
      enrollmentData?.progressPercentage;

    if (direct != null) return Number(direct);

    const completedModules = Number(course?.completed_modules ?? 0) || 0;
    const totalModules = Number(course?.module_count ?? course?.modules?.length ?? 0) || 0;
    if (totalModules > 0) return Math.round((completedModules / totalModules) * 100);

    return 0;
  }, [enrolled, enrollmentData, course]);

  const progress = useMemo(() => quantizeProgress(rawProgress), [rawProgress]);
  const progressInfo = useMemo(() => progressMeta(progress), [progress]);
  const ProgressIcon = progressInfo.icon;

  const handleEnrollOrContinue = async (e) => {
    e.stopPropagation();
    if (loading) return;

    if (enrolled) {
      handleOpen();
      return;
    }

    setLoading(true);
    try {
      const res = await enrollInCourse(course.id);

      if (res?.payment_required && res?.data?.checkout_url) {
        toast("Redirecting to payment…", {
          description: "Complete checkout to unlock this course.",
        });
        window.location.href = res.data.checkout_url;
        return;
      }

      if (!res?.ok) {
        toast("Enrollment failed", {
          description: res?.data?.error || "Try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      toast("Enrolled successfully ✅", {
        description: isFree ? "This course is now unlocked." : "You're in!",
      });

      handleOpen();
    } catch (err) {
      toast("Enrollment failed", {
        description: err?.response?.data?.error || err?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    setShowPreview(true);
  };

  const mediaH = compact ? "h-28" : "h-40 sm:h-48";
  const shellP = compact ? "p-3" : "p-4";
  const contentP = compact ? "p-3" : "p-4";
  const footerP = compact ? "px-3 pb-3" : "px-4 pb-4";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        whileHover={{ y: -3 }}
      >
        <Card
          className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 group ${shellP}`}
          onClick={handleOpen}
        >
          {/* Preview Button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300 shadow-sm"
            onClick={handlePreviewClick}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>

          {/* Bento overlay */}
          <div className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`border border-gray-200 ${i % 2 === 0 ? "bg-blue-100" : "bg-purple-100"}`}
                />
              ))}
            </div>
          </div>

          {/* Media */}
          <CardHeader className={`p-0 ${mediaH} overflow-hidden relative rounded-lg`}>
            {firstModule?.video_url ? (
              <div className="relative w-full h-full">
                {renderThumbnail(firstModule)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-center px-4">
                <Lottie
                  animationData={bgAnimation}
                  loop={true}
                  className={`${compact ? "w-20 h-20" : "w-28 h-28"} mb-1`}
                />
              </div>
            )}

            {/* Top-right badges */}
            <div className="absolute top-2.5 right-2.5 flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                {enrolled ? "Enrolled" : "New"}
              </Badge>

              <Badge
                className={`shadow-md flex items-center gap-1 ${
                  isFree ? "bg-green-600 text-white" : "bg-black/80 text-white"
                }`}
              >
                {isFree ? <Zap className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {priceLabel}
              </Badge>

              <Badge variant="secondary" className="shadow-md flex items-center gap-1">
                <TechIcon className="h-3 w-3" />
                Tech
              </Badge>
            </div>

            {/* Duration */}
            {course?.duration && (
              <Badge
                variant="secondary"
                className="absolute bottom-2.5 left-2.5 flex items-center gap-1 shadow-md"
              >
                <Clock className="h-3 w-3" />
                <span className="text-xs">{course.duration}</span>
              </Badge>
            )}
          </CardHeader>

          {/* Content */}
          <CardContent className={`relative z-10 ${contentP}`}>
            <CardTitle className={`font-bold ${compact ? "text-[15px]" : "text-lg"} line-clamp-2`}>
              {course?.title}
            </CardTitle>

            <div className="my-2.5 h-[3px] bg-gradient-to-r from-blue-200 via-purple-200 to-transparent rounded-full" />

            <p className="text-muted-foreground text-sm line-clamp-2">
              {course?.description || "No description provided"}
            </p>

            {/* Meta row */}
            <div className={`grid grid-cols-2 gap-2 ${compact ? "mt-3" : "mt-4"}`}>
              <div className="bg-blue-50/60 p-2 rounded-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">
                  {course?.module_count || course?.modules?.length || 0} Modules
                </span>
              </div>

              <div className="bg-purple-50/60 p-2 rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium">{course?.student_count || 0} Learners</span>
              </div>
            </div>

            {/* Progress */}
            {(enrolled || enrollmentData) && (
              <div className={`mt-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur px-3 py-2`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${progressInfo.tone}`}>
                      <ProgressIcon className="h-3.5 w-3.5" />
                      {progressInfo.label}
                    </span>
                    <span className="text-xs text-gray-500">Progress</span>
                  </div>

                  <span className="text-xs font-semibold text-gray-800">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Small milestones row */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500">
                  <span className={progress >= 0 ? "text-gray-700 font-medium" : ""}>0</span>
                  <span className={progress >= 30 ? "text-gray-700 font-medium" : ""}>30</span>
                  <span className={progress >= 60 ? "text-gray-700 font-medium" : ""}>60</span>
                  <span className={progress >= 90 ? "text-gray-700 font-medium" : ""}>90</span>
                  <span className={progress >= 100 ? "text-gray-700 font-medium" : ""}>100</span>
                </div>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className={`relative z-10 ${footerP}`}>
            <Button
              size={compact ? "sm" : "default"}
              className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
              onClick={handleEnrollOrContinue}
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {enrolled ? (
                  <>
                    Continue <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : isFree ? (
                  <>
                    {loading ? "Enrolling..." : "Enroll Free"}{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    {loading ? "Starting Checkout..." : "Unlock & Pay"}{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        course={course}
        enrolled={enrolled}
        onEnroll={handleEnrollOrContinue}
      />
    </>
  );
}