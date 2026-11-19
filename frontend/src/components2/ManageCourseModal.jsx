import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog"
import { Button } from "@/components2/ui/button"
import { getModulesByCourse, deleteModuleById } from "@/services/modules"
import { getCourseById } from "@/services/courses"
import { publishCourse } from "@/services/publish"
import UploadContentModal from "@/creator/UploadContent"
import EditModuleModal from "./EditModuleModal"
import CreateCourseModal from "./CreateCourseModal"
import { getCloudinaryThumbnail } from "@/utils/media"

export default function ManageCourseModal({ course, open, onClose }) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)

  const [showUpload, setShowUpload] = useState(false)
  const [editModule, setEditModule] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const [currentCourse, setCurrentCourse] = useState(course)
  const [thumbnailErrorMap, setThumbnailErrorMap] = useState({})

  // publish flow
  const [showPublish, setShowPublish] = useState(false)
  const [publishType, setPublishType] = useState("free") // free | paid
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("usd")
  const [publishing, setPublishing] = useState(false)

  const draftKey = useMemo(
    () => (currentCourse?.id ? `module-draft-${currentCourse.id}` : null),
    [currentCourse?.id]
  )

  const hasDraft = draftKey ? !!localStorage.getItem(draftKey) : false

  const canPublish = (modules?.length || 0) >= 3

  useEffect(() => setCurrentCourse(course), [course])

  useEffect(() => {
    if (currentCourse?.id && open) fetchModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCourse?.id, open])

  const fetchModules = async () => {
    setLoading(true)
    try {
      const res = await getModulesByCourse(currentCourse.id)
      setModules(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (moduleId) => {
    if (modules?.length && moduleId !== modules[modules.length - 1]?.id) {
      return alert("Only the last module can be deleted to maintain structure.")
    }
    try {
      await deleteModuleById(moduleId)
      fetchModules()
    } catch (err) {
      alert("Failed to delete module")
    }
  }

  const handleCourseUpdated = async () => {
    const updated = await getCourseById(currentCourse.id)
    setCurrentCourse(updated)
    await fetchModules()
  }

  const resetPublishState = () => {
    setPublishType("free")
    setPrice("")
    setCurrency("usd")
    setPublishing(false)
  }

  const confirmPublish = async () => {
    if (!currentCourse?.id) return
    if (!canPublish) return

    const isPaid = publishType === "paid"
    const numeric = Number(price)

    if (isPaid) {
      if (!price || Number.isNaN(numeric) || numeric <= 0) {
        alert("Enter a valid price for a paid course.")
        return
      }
    }

    setPublishing(true)
    try {
      const payload = isPaid
        ? {
            is_paid: true,
            price_cents: Math.round(numeric * 100),
            currency,
          }
        : {
            is_paid: false,
            price_cents: 0,
            currency,
          }

      await publishCourse(currentCourse.id, payload)

      setShowPublish(false)
      resetPublishState()
      await handleCourseUpdated()
      alert("Course published successfully ✅")
    } catch (e) {
      console.error(e)
      alert("Publish failed. Check backend route & permissions.")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-7xl h-[92svh] p-0 overflow-hidden">
        {/* Sticky header */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/45 to-transparent" />
          <DialogHeader className="sticky top-0 z-20 px-5 sm:px-6 py-5 bg-white/75 backdrop-blur-xl border-b border-white/10">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-[#2C365E] flex items-center gap-2 min-w-0">
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#EA7125] shadow-[0_0_0_5px_rgba(234,113,37,0.15)]" />
              <span className=" ">Manage Course: {currentCourse?.title}</span>
            </DialogTitle>

            <DialogDescription className="text-sm sm:text-base text-[#2C365E]/70 leading-relaxed">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2">{currentCourse?.description}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85 text-[#2C365E]"
                >
                  ✏️ Edit Course Info
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="h-[calc(92svh-92px)] min-h-0 flex flex-col pb-42 px-5 sm:px-6 pt-4 bg-white/45 backdrop-blur-xl">
          {/* Draft resume banner */}
          {hasDraft && (
            <div className="mb-4 rounded-2xl border border-[#EA7125]/20 bg-[#EA7125]/10 px-4 py-3 text-sm text-[#2C365E] flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">📝 Unfinished draft module detected</div>
                <div className="text-xs text-[#2C365E]/70 mt-1">
                  Continue where you left off, then publish when ready.
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowUpload(true)}
                className="rounded-xl text-white"
                style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
              >
                Resume
              </Button>
            </div>
          )}

          {/* Modules header row */}
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#2C365E]">
                Modules ({modules?.length || 0})
              </div>
              <div className="text-xs text-[#2C365E]/60">
                Only the last module can be deleted (to preserve sequence).
              </div>
            </div>

            <Button
              onClick={() => setShowUpload(true)}
              className="rounded-xl text-white px-4 shrink-0"
              style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
            >
              ➕ Upload Module
            </Button>
          </div>

          {/* Scroll region */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/15 bg-white/55 p-5 animate-pulse">
                <div className="h-4 w-40 bg-[#2C365E]/10 rounded mb-2" />
                <div className="h-3 w-72 bg-[#2C365E]/10 rounded" />
              </div>
            ) : modules?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2C365E]/15 bg-white/50 p-8 text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-sm font-semibold text-[#2C365E]">
                  No modules yet
                </div>
                <div className="text-xs text-[#2C365E]/60 mt-1">
                  Upload your first module to start building this course.
                </div>
              </div>
            ) : (
              modules.map((mod, idx) => {
                const isLast = idx === modules.length - 1
                const canDelete = isLast
                const thumbFailed = !!thumbnailErrorMap[mod.id]

                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-white/15 bg-white/60 backdrop-blur-xl p-3 sm:p-4 shadow-[0_10px_30px_rgba(44,54,94,0.06)]"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumb */}
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-[#2C365E]/5 border border-white/20 shrink-0">
                        {!thumbFailed ? (
                          <img
                            src={getCloudinaryThumbnail(mod.video_url)}
                            alt={`Thumbnail for ${mod.title}`}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setThumbnailErrorMap((prev) => ({ ...prev, [mod.id]: true }))
                            }
                          />
                        ) : (
                          <video
                            src={mod.video_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              e.target.currentTime = 1
                              e.target.pause()
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#2C365E] break-words">
                              {mod.title}
                            </h3>
                            <p className="text-sm text-[#2C365E]/70 line-clamp-2 mt-1 break-words">
                              {mod.description}
                            </p>
                          </div>

                          <span className="shrink-0 text-[11px] font-semibold rounded-full px-2 py-1 border border-white/20 bg-white/70 text-[#2C365E]/80">
                            Module {idx + 1}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-[#2C365E]/55">
                          Duration: {mod.duration || 5} min
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditModule(mod)}
                            className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85"
                          >
                            ✏️ Edit
                          </Button>

                          {/* ✅ ONLY LAST MODULE GETS ADD NEXT */}
                          {isLast && (
                            <Button
                              size="sm"
                              onClick={() => setShowUpload(true)}
                              className="rounded-xl text-white"
                              style={{ backgroundColor: "rgba(44,54,94,0.92)" }}
                            >
                              ➕ Add Next
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(mod.id)}
                              className="rounded-xl bg-red-500/85 text-white hover:bg-red-500"
                            >
                              🗑️ Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Upload Modal */}
          {showUpload && currentCourse?.id && (
            <UploadContentModal
              open={showUpload}
              courseId={currentCourse.id}
              onClose={() => {
                setShowUpload(false)
                fetchModules()
              }}
              draft={draftKey ? localStorage.getItem(draftKey) : null}
              onDraftSave={(data) =>
                draftKey && localStorage.setItem(draftKey, JSON.stringify(data))
              }
              onDraftClear={() => draftKey && localStorage.removeItem(draftKey)}
            />
          )}

          {/* Edit Course Modal */}
          {showEditModal && (
            <CreateCourseModal
              courseId={currentCourse.id}
              open={showEditModal}
              onClose={() => setShowEditModal(false)}
              openManage={() => {
                setShowEditModal(false)
                handleCourseUpdated()
              }}
            />
          )}

          {/* Edit Module Modal */}
          {editModule && (
            <EditModuleModal
              module={editModule}
              onClose={() => {
                setEditModule(null)
                fetchModules()
              }}
            />
          )}

          {/* Publish Confirm Popup */}
          {showPublish && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                  setShowPublish(false)
                  resetPublishState()
                }}
              />
              <div className="relative w-full max-w-xl rounded-2xl bg-white/90 backdrop-blur-xl border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5 bg-gradient-to-r from-[#EA7125]/10 via-white/40 to-[#2C365E]/10">
                  <div className="text-lg font-bold text-[#2C365E]">
                    Publish Course
                  </div>
                  <div className="text-xs text-[#2C365E]/70 mt-1">
                    Choose Free or Paid. Paid requires a valid price.
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setPublishType("free")}
                      className={`rounded-xl border p-3 text-left transition ${
                        publishType === "free"
                          ? "border-[#66A569]/40 bg-[#66A569]/10"
                          : "border-black/10 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="font-semibold text-[#2C365E]">Free</div>
                      <div className="text-xs text-[#2C365E]/70 mt-1">
                        Best for growth and creators building an audience.
                      </div>
                    </button>

                    <button
                      onClick={() => setPublishType("paid")}
                      className={`rounded-xl border p-3 text-left transition ${
                        publishType === "paid"
                          ? "border-[#EA7125]/45 bg-[#EA7125]/10"
                          : "border-black/10 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="font-semibold text-[#2C365E]">Paid</div>
                      <div className="text-xs text-[#2C365E]/70 mt-1">
                        Requires price. Strong for premium / deep courses.
                      </div>
                    </button>
                  </div>

                  {publishType === "paid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-[#2C365E]/80">
                          Price
                        </label>
                        <input
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 19.99"
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 p-2.5 text-sm outline-none focus:ring-4 focus:ring-[#EA7125]/15"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#2C365E]/80">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 p-2.5 text-sm outline-none focus:ring-4 focus:ring-[#EA7125]/15"
                        >
                          <option value="usd">USD</option>
                          <option value="cad">CAD</option>
                          <option value="eur">EUR</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {!canPublish && (
                    <div className="rounded-xl border border-[#EA7125]/20 bg-[#EA7125]/10 p-3 text-xs text-[#2C365E]/80">
                      Publishing is recommended only when you have at least <strong>3 modules</strong>.
                      Add more modules before publishing.
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 border-t border-black/5 bg-white/70 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setShowPublish(false)
                      resetPublishState()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!canPublish || publishing}
                    className="rounded-xl text-white"
                    style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
                    onClick={confirmPublish}
                  >
                    {publishing ? "Publishing..." : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer (main modal footer) */}
        <div className="sticky bottom-0  z-30 bg-white/80 backdrop-blur-xl border-t border-white/15 px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-[#2C365E]/70">
            {canPublish ? "Ready to publish." : "Add at least 3 modules to publish."}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              disabled={!canPublish}
              className="rounded-xl text-white"
              style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
              onClick={() => setShowPublish(true)}
            >
              Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
