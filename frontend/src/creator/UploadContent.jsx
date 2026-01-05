import React, { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog"
import { Button } from "@/components2/ui/button"
import { getCourseById } from "@/services/courses"
import { getModulesByCourse, createModule, publishReviewedModule } from "@/services/modules"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"
import { toast } from "@/components2/ui/use-toast"
import UploadModuleLoading from "@/components2/ui/UploadModuleLoading"
import { CheckCircle, Circle } from "lucide-react"
import { compressVideo } from "@/utils/compressVideo"

export function checkVideoDuration(file, maxSeconds = 600) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration
      if (duration > maxSeconds) {
        reject(new Error(`Video is too long. Max allowed is ${maxSeconds / 60} minutes.`))
      } else {
        resolve(duration)
      }
    }

    video.onerror = () => reject(new Error("Unable to load video metadata."))
    video.src = URL.createObjectURL(file)
  })
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50)
}

export default function UploadContentModal({
  courseId,
  open,
  onClose,
  draft,
  onDraftSave,
  onDraftClear,
}) {
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState(null)

  const [isUploading, setIsUploading] = useState(false)
  const [reviewData, setReviewData] = useState(null)
  const [currentStep, setCurrentStep] = useState("uploading")

  const lastModule = modules?.[modules.length - 1]

  // Load course data
  useEffect(() => {
    if (!courseId || !open) return

    const loadData = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourseById(courseId),
          getModulesByCourse(courseId),
        ])
        setCourse(courseRes?.data ?? courseRes)
        setModules(modulesRes || [])
      } catch (error) {
        console.error("Failed to load course data:", error)
        toast("Error", { description: "Failed to load course data" })
      }
    }

    loadData()
  }, [courseId, open])

  // Load draft if exists
  useEffect(() => {
    if (!draft) return
    try {
      const parsed = JSON.parse(draft)
      setTitle(parsed.title || "")
      setDescription(parsed.description || "")
      toast("Draft loaded", { description: "Resume your module creation" })
    } catch {
      console.warn("Failed to parse draft data")
    }
  }, [draft])

  const saveDraft = () => {
    onDraftSave?.({ title, description })
    toast("Draft saved", { description: "You can return to it later" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile) {
      toast("Missing video", { description: "Please select a video file" })
      return
    }

    try {
      await checkVideoDuration(videoFile, 600)
    } catch (err) {
      toast("Video too long", { description: err.message })
      return
    }

    if (videoFile.size > 300 * 1024 * 1024) {
      toast("File too large", { description: "Max size is 300MB" })
      return
    }

    const renamedFile = new File([videoFile], `${slugify(title)}.mp4`, {
      type: videoFile.type,
    })

    const moduleData = {
      title,
      description,
      course_id: courseId,
      order: modules.length + 1,
      created_at: new Date().toISOString(),
    }

    try {
      setIsUploading(true)
      setCurrentStep("uploading")

      // ✅ Compress before upload
      const compressedFile = await compressVideo(renamedFile)
      const videoUrl = await uploadToCloudinary(compressedFile)

      setCurrentStep("transcribing")
      const res = await createModule({ ...moduleData, video_url: videoUrl })

      setCurrentStep("quiz")

      setReviewData({
        module: { ...moduleData, video_url: videoUrl },
        transcript: res?.transcript || "",
        quiz: res?.quiz_questions || [],
      })

      setCurrentStep("complete")
    } catch (err) {
      toast("Upload failed", { description: err.message })
    } finally {
      setIsUploading(false)
    }
  }

  const handlePublish = async () => {
    if (!reviewData) return

    try {
      setIsUploading(true)
      setCurrentStep("publishing")

      await publishReviewedModule({
        ...reviewData.module,
        transcript: reviewData.transcript,
        quiz: reviewData.quiz,
      })

      onDraftClear?.()
      toast("Success", { description: "Module published successfully" })
      onClose()
    } catch (error) {
      console.error("Publish failed:", error)
      toast("Publish failed", {
        description: error.message || "Check your connection and try again",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const fileLabel = useMemo(() => {
    if (!videoFile) return "MP4, MOV or AVI (MAX. 300MB)"
    const sizeMB = (videoFile.size / (1024 * 1024)).toFixed(1)
    return `${videoFile.name} • ${sizeMB}MB`
  }, [videoFile])

  return (
    <>
      {/* Loading overlay */}
      {isUploading &&
        typeof window !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/75 backdrop-blur-md"
          >
            <div className="w-[92vw] max-w-md rounded-2xl border border-white/25 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-4">
              <UploadModuleLoading currentStep={currentStep} />
            </div>
          </motion.div>,
          document.body
        )}

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 bg-white/70 backdrop-blur-xl border-b border-white/10">
            <DialogTitle className="text-xl font-bold text-[#2C365E]">
              Upload Module{" "}
              <span className="text-[#EA7125]">{course?.title ? `→ ${course.title}` : ""}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-[#2C365E]/70">
              Add a new lesson, generate transcript + quiz, then publish.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 bg-white/45 backdrop-blur-xl">
            {/* Course info */}
            <div className="mb-5 rounded-2xl border border-white/15 bg-white/55 backdrop-blur-xl p-4 text-sm text-[#2C365E]/75">
              <p>
                📚 <strong className="text-[#2C365E]">{modules.length}</strong> modules in this course
              </p>
              {lastModule && (
                <p className="mt-1">
                  ⏱️ Last module:{" "}
                  <span className="font-medium text-[#2C365E]">{lastModule.title}</span>{" "}
                  ({lastModule.duration || "N/A"} min)
                </p>
              )}
            </div>

            {!reviewData ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">Module Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                      focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                    placeholder="Introduction to Course"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                      focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                    placeholder="What will students learn in this module?"
                  />
                </div>

                {/* Dropzone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2C365E]">Video File</label>

                  <label className="group flex flex-col items-center justify-center w-full h-36 rounded-2xl cursor-pointer
                    border border-dashed border-[#2C365E]/20 bg-white/55 backdrop-blur-xl
                    hover:bg-white/70 transition"
                  >
                    <div className="text-3xl">🎬</div>
                    <p className="mt-2 text-sm text-[#2C365E]/70">
                      <span className="font-semibold text-[#2C365E]">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-[#2C365E]/55 mt-1">{fileLabel}</p>

                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={isUploading}
                    className="rounded-xl border-white/25 bg-white/60 backdrop-blur hover:bg-white/80"
                  >
                    Save Draft
                  </Button>

                  <Button
                    type="submit"
                    disabled={isUploading || !videoFile}
                    className="rounded-xl text-white px-5"
                    style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
                  >
                    {isUploading ? "Processing..." : "Upload Module"}
                  </Button>
                </div>
              </form>
            ) : (
              // ✅ Review Screen (height locked, scroll content, sticky footer)
              <div className="rounded-2xl border border-white/15 bg-white/55 backdrop-blur-xl overflow-hidden">
                <div className="max-h-[62vh] overflow-y-auto p-4 space-y-6">
                  {/* Transcript */}
                  <div>
                    <h3 className="text-base font-semibold text-[#2C365E] mb-2">
                      📝 Transcript
                    </h3>
                    <div className="rounded-2xl border border-white/15 bg-white/60 p-4 text-sm text-[#2C365E]/80 whitespace-pre-wrap">
                      {reviewData.transcript}
                    </div>
                  </div>

                  {/* Quiz */}
                  <div>
                    <h3 className="text-base font-semibold text-[#2C365E] mb-2">
                      📚 Quiz Questions
                    </h3>

                    {Array.isArray(reviewData?.quiz) && reviewData.quiz.length > 0 ? (
                      <div className="space-y-3">
                        {reviewData.quiz.map((q, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-white/15 bg-white/60 p-4"
                          >
                            <p className="font-semibold text-sm text-[#2C365E] mb-2">
                              <span className="text-[#EA7125]">Q{idx + 1}:</span>{" "}
                              {q.question_text}
                            </p>
                            <ul className="space-y-2">
                              {q.choices.map((choice, i) => {
                                const correct = choice === q.correct_answer
                                return (
                                  <li
                                    key={i}
                                    className={`rounded-xl border border-white/10 px-3 py-2 text-sm flex items-center gap-2 ${
                                      correct
                                        ? "bg-emerald-500/10"
                                        : "bg-white/40"
                                    }`}
                                  >
                                    {correct ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-[#2C365E]/25" />
                                    )}
                                    <span className="text-[#2C365E]/85">{choice}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#2C365E]/60 italic py-2">
                        No quiz generated for this module.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white/65 backdrop-blur-xl p-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setReviewData(null)}
                    className="rounded-xl border-white/25 bg-white/60 backdrop-blur hover:bg-white/80"
                  >
                    Back to Edit
                  </Button>

                  <Button
                    onClick={handlePublish}
                    disabled={isUploading}
                    className="rounded-xl text-white px-5"
                    style={{ backgroundColor: "rgba(44,54,94,0.92)" }} // navy publish
                  >
                    {isUploading ? "Publishing..." : "Publish Module"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
