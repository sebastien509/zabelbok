// src/components/CoursePreviewModal.jsx
import React, { useMemo } from "react";
import { Button } from "@/components2/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog";
import { X, Video, BookOpen, Users, Clock, ArrowRight, Loader2 } from "lucide-react";

export default function CoursePreviewModal({
  open,
  onClose, // ✅ function () => void
  course,
  enrolled = false,
  isFree = true,
  loading = false,
  handleEnroll, // ✅ function () => void (enroll or pay)
}) {
  // ✅ Only trust course.intro_url (as requested)
  const hasIntro = useMemo(() => !!course?.intro_url, [course]);

  // If modal is opened without intro, we still render (safe),
  // but in your CourseCard we will not open it / not show preview button.
  const moduleCount = Number(course?.module_count || course?.modules?.length || 0);
  const learnerCount = Number(course?.student_count || 0);
  const duration = course?.duration || "Self-paced";

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : null)}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl bg-white">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Video Section */}
          <div className="aspect-video bg-black">
            {hasIntro ? (
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
          <div className="p-5 sm:p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {course?.title || "Course Preview"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-2">
                {course?.description || "No description provided"}
              </DialogDescription>
            </DialogHeader>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 border-y">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{moduleCount}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Modules</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">{learnerCount}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Learners</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-xs sm:text-sm">{duration}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Duration</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                size="lg"
                className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={enrolled ? onClose : handleEnroll}
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-2">
                  {enrolled ? (
                    <>
                      Start Course{" "}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : isFree ? (
                    <>
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          Enroll Free{" "}
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Starting Checkout...
                        </>
                      ) : (
                        <>
                          Unlock & Pay{" "}
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
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

