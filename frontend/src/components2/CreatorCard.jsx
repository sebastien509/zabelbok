import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components2/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components2/ui/avatar";
import { Button } from "@/components2/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users2, ArrowRight, Sparkles, X } from "lucide-react";
import CourseCard from "@/components2/CourseCard";
import toast from "react-hot-toast";
const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "CR";

export default function CreatorCard({
  creator,
  compact = false,
  courses = [],
  enrolledCourseIds = [],
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  const initials = useMemo(() => initialsOf(creator?.full_name), [creator?.full_name]);

  const coverUrl =
    creator?.banner_url ||
    creator?.banner_image_url ||
    creator?.cover_url ||
    creator?.header_image_url ||
    null;

    const courseCount = (courses?.length || 0) || Number(creator?.published_courses_count || 0);

    const totalLearners = useMemo(() => {
      if (courses?.length) {
        return (courses || []).reduce((sum, c) => {
          const n = Number(c.student_count || c.enrollment_count || c.learners || 0);
          return sum + (Number.isFinite(n) ? n : 0);
        }, 0);
      }
      return Number(creator?.unique_learners_count || 0);
    }, [courses, creator]);
    

  const handleViewProfile = () => {
    navigate(`/${creator.slug}`);
  };

  const handleCardClick = (e) => {
    // Don't open modal if clicking on the View Page button
    if (e.target.closest('button[class*="View Page"]') || 
        e.target.closest('button[class*="border-gray-300"]')) {
      return;
    }
    
    if (courseCount > 0) {
      setOpen(true);
    }
  };

  const handleCoursesClick = (e) => {
    e.stopPropagation();
    if (courseCount > 0) {
      setOpen(true);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative"
      >
        <Card
          className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
            compact ? "text-sm" : ""
          }`}
          onClick={handleCardClick}
        >
          {/* Card top (simple & clean) */}
          <div className={`relative w-full ${compact ? "h-28" : "h-32"}`}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${creator?.full_name || "Creator"} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-white" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-white/0" />
          </div>

          {/* Avatar + name */}
          <CardHeader className={`relative pt-0 ${compact ? "px-4 pb-3" : "px-5 pb-4"}`}>
            {/* 2x larger avatar */}
            <div className="flex justify-center -mt-10">
              <div className="rounded-full bg-white p-1.5 shadow-lg">
                <Avatar className={compact ? "h-20 w-20" : "h-24 w-24"}>
                  <AvatarImage src={creator?.profile_image_url} alt={creator?.full_name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="mt-2 text-center">
              <CardTitle
                className={`font-semibold text-gray-900 truncate mx-auto ${
                  compact ? "text-sm max-w-[220px]" : "text-base max-w-[260px]"
                }`}
                title={creator?.full_name}
              >
                {creator?.full_name}
              </CardTitle>

              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <BookOpen className="h-3 w-3" />
                  {courseCount} courses
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  <Users2 className="h-3 w-3" />
                  {totalLearners} learners
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className={`${compact ? "px-4 pb-3" : "px-5 pb-4"} text-gray-600`}>
            <p className={`${compact ? "text-xs" : "text-sm"} line-clamp-2`}>
              {creator?.bio || "No bio available"}
            </p>
          </CardContent>

          <CardFooter className={`${compact ? "px-4 pb-4" : "px-5 pb-5"} pt-0 flex gap-2`}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
            >
              View Page <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={handleCoursesClick}
              disabled={!courseCount}
              title={!courseCount ? "No courses yet" : "View courses"}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Courses
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
              onClick={handleCloseModal}
            />

            <motion.div
              ref={modalRef}
              className="
                relative w-full sm:max-w-5xl bg-white
                rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
                max-h-[90vh]
              "
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal header with banner background */}
              <div className="relative h-40 sm:h-48">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Creator banner"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-white" />
                )}

                {/* overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-white/0" />

                {/* close button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition shadow z-10"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-800" />
                </button>

                {/* avatar + name overlay */}
                <div className="absolute left-5 sm:left-6 bottom-0 translate-y-1/2 flex items-center gap-4">
                  <div className="rounded-full bg-white p-2 shadow-xl">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                      <AvatarImage src={creator?.profile_image_url} alt={creator?.full_name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="pb-2">
                    <div className="text-white font-semibold text-lg sm:text-xl drop-shadow">
                      {creator?.full_name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 text-blue-700 border border-white/50">
                        <BookOpen className="h-3 w-3" />
                        {courseCount} courses
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 text-purple-700 border border-white/50">
                        <Users2 className="h-3 w-3" />
                        {totalLearners} learners
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* spacing for avatar overlap */}
              <div className="h-14 sm:h-16" />

              {/* Scrollable courses area */}
              <div className="px-5 sm:px-6 pb-6 overflow-y-auto max-h-[60vh]">
                {courses?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        enrolled={enrolledCourseIds.includes(Number(course.id))}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-600">
                    This creator doesn't have any published courses yet.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  className="border-gray-300"
                  onClick={() => {
                    handleCloseModal();
                    setTimeout(() => handleViewProfile(), 10);
                  }}
                >
                  View Creator Page <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button className="bg-gray-900 hover:bg-gray-800 text-white" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}