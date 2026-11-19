import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog"
import { createCourse, updateCourse, getCourseById } from "@/services/courses"
import { toast } from "@/components2/ui/use-toast"
import { Button } from "@/components2/ui/button"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"
import { Upload, Video, X, Loader2 } from "lucide-react"

const unwrap = (res) => res?.data ?? res

export default function CreateCourseModal({ open, onClose, courseId, onCreated }) {
  const isEditing = Boolean(courseId)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [introUrl, setIntroUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [initLoaded, setInitLoaded] = useState(false)
  const [introUploading, setIntroUploading] = useState(false)
  const [introProgress, setIntroProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  
  const school_id = 1

  const headerText = useMemo(
    () => (isEditing ? "Edit Course" : "Create New Course"),
    [isEditing]
  )

  const handleIntroUpload = async (file) => {
    if (!file) return

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
    if (!validTypes.includes(file.type)) {
      toast(
        "Invalid file type",
        { description: "Please upload a video file (MP4, WebM, OGG, MOV)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (200MB max)
    const maxMB = 200
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxMB) {
      toast(
         "File too large",
         {description: `Video must be under ${maxMB}MB.`,
        variant: "destructive",
      })
      return
    }

    setIntroUploading(true)
    setIntroProgress(0)

    try {
      const url = await uploadToCloudinary(file, {
        folder: "courses/intros",
        resource_type: "video",
        onProgress: (progress) => setIntroProgress(Math.round(progress)),
      })

      // Extract URL from response
      const finalUrl = typeof url === "string" ? url : (url?.secure_url || url?.url)

      if (!finalUrl) throw new Error("Upload succeeded but no URL returned")

      setIntroUrl(finalUrl)

      toast(
        "Video uploaded",
        {description: "Introduction video has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast(
       "Upload failed",
       {  description: error?.message || "Could not upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIntroUploading(false)
      setIntroProgress(0)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleIntroUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) handleIntroUpload(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const removeIntroVideo = () => {
    setIntroUrl("")
    toast(
     "Video removed",
     { description: "Introduction video has been removed.",
    })
  }

  // ✅ Load course data ONLY when editing
  useEffect(() => {
    const loadCourseData = async () => {
      if (!open) return

      if (!isEditing) {
        setInitLoaded(true)
        return
      }

      try {
        setLoading(true)
        setInitLoaded(false)

        const res = await getCourseById(courseId)
        const data = unwrap(res)
        const course = data?.course ?? data

        if (!course) throw new Error("Course data not found")

        setTitle(course.title || "")
        setDescription(course.description || "")
        setIntroUrl(course.intro_url || "")
        setInitLoaded(true)
      } catch (error) {
        console.error("Failed to fetch course:", error)
        toast(
        "Error",
        { description: "Failed to load course data",
          variant: "destructive",
        })
        onClose?.()
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [open, isEditing, courseId, onClose])

  // ✅ Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setIntroUrl("")
      setInitLoaded(false)
      setLoading(false)
      setIntroUploading(false)
      setIntroProgress(0)
      setDragActive(false)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!title.trim() || !description.trim()) {
      toast(
      "Error",
      {  description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const courseData = { 
        title, 
        description,
        ...(introUrl.trim() && { intro_url: introUrl.trim() })
      }

      if (isEditing) {
        await updateCourse(courseId, courseData)
        toast(
        "Success",
        {  description: `"${title}" updated successfully.`,
        })
        onClose?.()
        return
      }

      const res = await createCourse({ 
        school_id, 
        ...courseData 
      })
      const data = unwrap(res)

      const newCourseId = data?.course_id ?? data?.course?.id ?? data?.id
      if (!newCourseId) {
        console.error("API Response:", data)
        throw new Error("Course created but no ID returned.")
      }

      toast(
     "Success",
     { description: `"${title}" created successfully.`,
      })
      onCreated?.(newCourseId)
      onClose?.()
    } catch (err) {
      console.error("Failed to save course:", err)
      toast(
       "Error",
       {description: err?.message || "Failed to save course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const titleCount = (title || "").trim().length
  const descCount = (description || "").trim().length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-2xl p-0 overflow-hidden">
        {/* top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/40 to-transparent" />

        {/* ✅ Sticky Header */}
        <DialogHeader className="sticky top-0 z-10 px-6 pt-6 pb-4 bg-white/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#2C365E] flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#EA7125] shadow-[0_0_0_5px_rgba(234,113,37,0.15)]" />
                <span className="truncate">{headerText}</span>
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-[#2C365E]/70 leading-relaxed">
                {isEditing
                  ? "Update your course details."
                  : "Create a new course. You can upload modules right after."}
                <div className="mt-1 text-xs text-[#2C365E]/60">
                  Required: <span className="font-semibold text-[#2C365E]">Title</span> +{" "}
                  <span className="font-semibold text-[#2C365E]">Description</span>
                </div>
              </DialogDescription>
            </div>

            {isEditing && (
              <span className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border border-[#2C365E]/10 bg-[#2C365E]/5 text-[#2C365E]">
                Editing
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 bg-white/45 backdrop-blur-xl max-h-[70vh] overflow-y-auto">
          {!initLoaded ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/15 bg-white/55 p-4 animate-pulse">
                <div className="h-4 w-44 bg-[#2C365E]/10 rounded mb-2" />
                <div className="h-10 w-full bg-[#2C365E]/10 rounded-xl" />
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/55 p-4 animate-pulse">
                <div className="h-4 w-44 bg-[#2C365E]/10 rounded mb-2" />
                <div className="h-28 w-full bg-[#2C365E]/10 rounded-xl" />
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/55 p-4 animate-pulse">
                <div className="h-4 w-44 bg-[#2C365E]/10 rounded mb-2" />
                <div className="h-32 w-full bg-[#2C365E]/10 rounded-xl" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Course Title
                  </label>
                  <span className="text-[11px] text-[#2C365E]/55">
                    {titleCount}/120
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="e.g. Intro to Product Strategy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/70 p-3.5 text-sm outline-none backdrop-blur
                    focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                  required
                  disabled={loading || introUploading}
                  maxLength={120}
                />

                <div className="text-xs text-[#2C365E]/60">
                  Keep it short + clear. Think "what outcome will learners get?"
                </div>
              </div>

              {/* Video Intro Upload Container */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Introduction Video (Optional)
                  </label>
                  {introUrl && (
                    <span className="text-[11px] text-[#2C365E]/55">
                      ✓ Video uploaded
                    </span>
                  )}
                </div>

                {!introUrl ? (
                  <div
                    className={`relative rounded-2xl border-2 border-dashed ${
                      dragActive 
                        ? "border-[#EA7125] bg-[#EA7125]/5" 
                        : "border-white/15 bg-white/70"
                    } p-6 transition-colors`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {introUploading ? (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#EA7125]" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#2C365E]">
                            Uploading video...
                          </p>
                          <p className="text-xs text-[#2C365E]/60 mt-1">
                            {introProgress}% complete
                          </p>
                          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-[#2C365E]/10 overflow-hidden">
                            <div 
                              className="h-full bg-[#EA7125] transition-all duration-300"
                              style={{ width: `${introProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="intro-video-upload"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="intro-video-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <div className="rounded-full bg-[#EA7125]/10 p-3 mb-3">
                            <Video className="h-6 w-6 text-[#EA7125]" />
                          </div>
                          <p className="text-sm font-medium text-[#2C365E]">
                            Upload introduction video
                          </p>
                          <p className="text-xs text-[#2C365E]/60 mt-1 text-center">
                            Drag & drop or click to browse
                          </p>
                          <p className="text-xs text-[#2C365E]/40 mt-2">
                            MP4, WebM, OGG, MOV • Max 200MB
                          </p>
                        </label>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/15 bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-[#EA7125]/10 p-2">
                          <Video className="h-5 w-5 text-[#EA7125]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#2C365E] truncate">
                            Introduction video ready
                          </p>
                          <p className="text-xs text-[#2C365E]/60 truncate">
                            {introUrl.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeIntroVideo}
                        className="h-8 w-8 p-0 text-[#2C365E]/60 hover:text-[#2C365E] hover:bg-[#2C365E]/5"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#2C365E]/60">
                  Upload a short video introducing the course. This helps boost engagement.
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-[#2C365E]">
                    Course Description
                  </label>
                  <span className="text-[11px] text-[#2C365E]/55">
                    {descCount}/800
                  </span>
                </div>

                <textarea
                  placeholder="What will students learn in this course? What problem does it solve?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/70 p-3.5 text-sm outline-none backdrop-blur
                    focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                  rows={7}
                  required
                  disabled={loading || introUploading}
                  maxLength={800}
                />

                <div className="text-xs text-[#2C365E]/60">
                  Tip: bullet-style sentences work great for mobile readability.
                </div>
              </div>

              {/* Mini guidance card */}
              {!isEditing && (
                <div className="rounded-2xl border border-[#EA7125]/20 bg-[#EA7125]/10 p-4 text-sm text-[#2C365E]">
                  <div className="font-semibold">✅ Recommended minimum</div>
                  <ul className="mt-2 text-xs text-[#2C365E]/75 list-disc pl-5 space-y-1">
                    <li>At least <strong>3 modules</strong> before publishing</li>
                    <li>Keep videos <strong>5–20 minutes</strong></li>
                    <li>Review transcript + quiz before publish</li>
                    <li>Intro video (optional) helps boost engagement</li>
                  </ul>
                </div>
              )}

              {/* Spacer so sticky footer never overlaps */}
              <div className="h-2" />
            </form>
          )}
        </div>

        {/* ✅ Sticky Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-4 bg-white/85 backdrop-blur-xl border-t border-white/12 flex items-center justify-between gap-2">
          <div className="text-xs text-[#2C365E]/65">
            {isEditing ? "Changes apply immediately." : "You can upload modules next."}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85"
              disabled={loading || introUploading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => {
                const form = document.querySelector("form")
                form?.requestSubmit?.()
              }}
              className="rounded-xl text-white px-5"
              style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
              disabled={loading || !initLoaded || introUploading}
            >
              {loading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}