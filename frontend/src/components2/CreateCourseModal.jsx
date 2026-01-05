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

export default function CreateCourseModal({
  open,
  onClose,
  courseId,
  onCreated,
}) {
  const isEditing = Boolean(courseId)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [initLoaded, setInitLoaded] = useState(false)

  const school_id = 1

  const headerText = useMemo(
    () => (isEditing ? "Edit Course" : "Create New Course"),
    [isEditing]
  )

  // Load data when modal opens and editing
  useEffect(() => {
    const loadCourseData = async () => {
      if (!open) return

      if (!isEditing) {
        setInitLoaded(true)
        return
      }

      try {
        setLoading(true)

        const res = await getCourseById(courseId)

        // supports either {data:{...}} or direct object
        const data = res?.data ?? res
        if (!data) throw new Error("Course data not found")

        setTitle(data.title || "")
        setDescription(data.description || "")
        setInitLoaded(true)
      } catch (error) {
        console.error("Failed to fetch course:", error)
        toast("Error", { description: "Failed to load course data" })
        onClose?.()
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [courseId, open, isEditing, onClose])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setInitLoaded(false)
      setLoading(false)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!title.trim() || !description.trim()) {
      toast("Error", { description: "Please fill all fields." })
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateCourse(courseId, { title, description })
        toast("Success", { description: `"${title}" updated successfully.` })
        onClose?.()
        return
      }

      const res = await createCourse({ school_id, title, description })

      // Updated to match your API response structure
      const newCourseId = res?.data?.course_id ?? res?.course_id

      if (!newCourseId) {
        console.error("API Response:", res)
        throw new Error("Course created but no ID returned.")
      }

      toast("Success", { description: `"${title}" created successfully.` })
      onCreated?.(newCourseId)
      onClose?.()
    } catch (err) {
      console.error("Failed to save course:", err)
      toast("Error", {
        description: err?.message || "Failed to save course. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        {/* top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/40 to-transparent" />

        <DialogHeader className="px-6 pt-6 pb-4 bg-white/70 backdrop-blur-xl border-b border-white/10">
          <DialogTitle className="text-xl font-bold text-[#2C365E] flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#EA7125] shadow-[0_0_0_5px_rgba(234,113,37,0.15)]" />
            {headerText}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#2C365E]/70 leading-relaxed">
            {isEditing
              ? "Update your course details below."
              : "Create a new course by filling the details below."}
            <br />
            <span className="font-semibold text-[#2C365E]">
              All fields are required.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 bg-white/45 backdrop-blur-xl">
          {!initLoaded ? (
            <div className="rounded-2xl border border-white/15 bg-white/55 p-4 text-sm text-[#2C365E]/70 animate-pulse">
              Loading course data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2C365E]">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intro to Product Strategy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                    focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2C365E]">
                  Course Description
                </label>
                <textarea
                  placeholder="What will students learn in this course?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/60 p-3 text-sm outline-none backdrop-blur
                    focus:ring-4 focus:ring-[#EA7125]/15 focus:border-[#EA7125]/35"
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl border-white/25 bg-white/60 backdrop-blur hover:bg-white/80"
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="rounded-xl text-white px-5"
                  style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Course"
                    : "Create Course"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
