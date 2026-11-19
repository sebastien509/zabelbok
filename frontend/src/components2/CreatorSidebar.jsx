import React, { useMemo } from "react"
import {
  Home,
  BookOpen,
  Upload,
  Settings,
  LogOut,
  PlusCircle,
  X,
  BarChart2,
  Lightbulb,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Film,
  Timer,
  ListChecks,
  TrendingUp,
  BadgeCheck,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import ProfileSettingsModal from "./ProfileSettingsModal"
import UploadContent from "@/creator/UploadContent"
import CreateCourseModal from "@/components2/CreateCourseModal"
import ManageCourseModal from "./ManageCourseModal"

// -----------------------------
// Helpers
// -----------------------------
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const navItems = [
  { label: "Dashboard", icon: Home, action: "dashboard" },
  { label: "Insights & Recs", icon: Lightbulb, action: "insights" },
  { label: "Monetization", icon: DollarSign, action: "monetization" },
  { label: "Profile Settings", icon: Settings, action: "profile-settings" },
]

// -----------------------------
// Simple Modal (no external UI deps)
// -----------------------------
function SimpleModal({ open, onClose, title, icon: Icon, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className={cn(
                "w-full max-w-[720px] rounded-2xl overflow-hidden",
                "bg-white/85 backdrop-blur-xl border border-white/30",
                "shadow-[0_30px_90px_rgba(0,0,0,0.25)]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-5 py-4 border-b border-black/5 bg-gradient-to-r from-[#EA7125]/10 via-white/30 to-[#2C365E]/10">
                <div className="flex items-start gap-3 pr-10">
                  <div className="h-10 w-10 rounded-xl bg-white/70 border border-white/40 flex items-center justify-center shadow-sm">
                    {Icon ? <Icon className="h-5 w-5 text-[#EA7125]" /> : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#2C365E] leading-tight">
                      {title}
                    </h3>
                    <p className="text-xs text-[#2C365E]/65 mt-0.5">
                      Quick, practical guidance based on what converts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/70 hover:bg-white"
                >
                  <X className="h-5 w-5 text-[#2C365E]" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 max-h-[82vh] overflow-y-auto">
                {children}
              </div>

              {/* Footer */}
              {footer ? (
                <div className="px-5 py-4 border-t border-black/5 bg-white/60">
                  {footer}
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function CreatorSidebar({
  onCustomize,
  onRefresh,
  activeModal,
  setActiveModal,
  courses = [],
  onLogout,
  mobileClose,
}) {
  const handleNavClick = (action) => setActiveModal(action)
  const isEmpty = !courses || courses.length === 0

  const totals = useMemo(() => {
    const totalCourses = courses.length
    const totalStudents = courses.reduce(
      (acc, c) => acc + Number(c.student_count || c.enrollment_count || 0),
      0
    )
    const totalModules = courses.reduce(
      (acc, c) => acc + Number(c.module_count || c.modules?.length || 0),
      0
    )
    return { totalCourses, totalStudents, totalModules }
  }, [courses])

  const copyInsights = () => {
    const text =
      `CREATOR RECS (FAST)\n` +
      `- Aim for 5–20 min videos (tight + high retention)\n` +
      `- Structure: Hook (10s) → Value (3–7m) → Proof → CTA\n` +
      `- Minimum 3 modules per course (better completion + sales)\n` +
      `- Review quizzes: 1 correct answer, no duplicates, clear wording\n` +
      `- Add: thumbnail + captions + transcript\n`
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success("Copied insights to clipboard"))
      .catch(() => toast("Copy failed", { description: "Your browser blocked clipboard access." }))
  }

  const handleLogout = () => {
    if (onLogout) return onLogout()
    localStorage.clear()
    toast.success("Logged out successfully")
    window.location.href = "/login"
  }

  return (
    <>
      <aside
        className={cn(
          "w-[280px] max-w-[400px] shrink-0",
          "h-full flex flex-col",
          "bg-white/70 backdrop-blur-xl",
          "border-r border-[#EA7125]/15",
          "shadow-[0_10px_30px_rgba(44,54,94,0.08)]",
          "relative"
        )}
      >
        {/* Top glow line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/40 to-transparent" />

        {/* Mobile Close */}
        {mobileClose && (
          <button
            onClick={mobileClose}
            className="md:hidden absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/70 backdrop-blur hover:bg-white/90"
          >
            <X className="h-5 w-5 text-[#EA7125]" />
          </button>
        )}

        {/* Header */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/55 p-3 backdrop-blur">
            <div className="bg-[#EA7125]/12 p-2.5 rounded-xl border border-[#EA7125]/15">
              <Sparkles className="h-5 w-5 text-[#EA7125]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold text-[#2C365E] leading-tight">
                Creator Hub
              </h2>
              <p className="text-xs text-[#2C365E]/60 truncate">
                Courses • Modules • Profile • Revenue
              </p>
            </div>
          </div>

          {/* Tiny stats */}
         
        </div>

        {/* Quick Actions */}
        <div className="px-3 -mt-1">
          <div className="rounded-2xl border border-white/20 bg-white/55 backdrop-blur p-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveModal("new-course")
                  mobileClose?.()
                }}
                className={cn(
                  "flex items-center mb-2  gap-2 rounded-xl px-3 py-2.5 text-xs w-full font-semibold",
                  "bg-[#EA7125] text-white shadow-sm hover:brightness-[1.03]"
                )}
              >
                <PlusCircle className="h-4 w-4" />
                New Course
              </motion.button>
              <div className="grid grid-cols-2 gap-2">

           

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveModal("insights")
                  mobileClose?.()
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold",
                  "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/15 hover:bg-[#7C3AED]/15"
                )}
              >
                <Lightbulb className="h-4 w-4" />
                Insights
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveModal("monetization")
                  mobileClose?.()
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold",
                  "bg-[#66A569]/10 text-[#66A569] border border-[#66A569]/15 hover:bg-[#66A569]/15"
                )}
              >
                <DollarSign className="h-4 w-4" />
                Monetize
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeModal === item.action

            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleNavClick(item.action)
                  mobileClose?.()
                }}
                className={cn(
                  "group flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition",
                  "border border-transparent",
                  active
                    ? "bg-[#EA7125]/10 text-[#EA7125] border-[#EA7125]/15 shadow-[0_8px_20px_rgba(234,113,37,0.10)]"
                    : "text-[#2C365E] hover:bg-[#2C365E]/5 hover:border-[#2C365E]/10"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    active ? "bg-[#EA7125]/12" : "bg-white/40 group-hover:bg-white/60",
                    "border border-white/25"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-[#EA7125]" : "text-[#2C365E]")} />
                </div>
                <span className="truncate">{item.label}</span>

                {active ? (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#EA7125] shadow-[0_0_0_4px_rgba(234,113,37,0.15)]" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4 text-[#2C365E]/30 group-hover:text-[#2C365E]/50" />
                )}
              </motion.button>
            )
          })}
        </nav>
        <button
        onClick={() => (window.location.href = "/creator/revenue")}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2C365E]/5 text-left"
      >
        <BarChart2 className="h-4 w-4 text-[#2C365E]" />
        <span className="text-sm font-medium">Revenue Analytics</span>
      </button>

        {/* Courses */}
        <div className="px-3 mt-5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[11px] font-semibold text-[#2C365E]/70 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              My Courses
            </h3>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveModal("new-course")
                mobileClose?.()
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
                "bg-[#EA7125] text-white shadow-sm",
                "hover:brightness-[1.03] active:brightness-[0.98]"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              New
            </motion.button>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/55 backdrop-blur p-2 min-h-0 flex flex-col">
            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
              {isEmpty ? (
                <div className="rounded-xl border border-dashed border-[#2C365E]/15 bg-white/40 p-4">
                  <p className="text-sm font-medium text-[#2C365E]">No courses yet</p>
                  <p className="text-xs text-[#2C365E]/60 mt-1">
                    Create a course, then upload at least 3 modules.
                  </p>
                </div>
              ) : (
                courses.map((course) => {
                  const active = activeModal === `manage-${course.id}`

                  return (
                    <motion.button
                      key={course.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setActiveModal(`manage-${course.id}`)
                        mobileClose?.()
                      }}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-2.5 text-sm transition",
                        "border border-transparent",
                        active
                          ? "bg-[#EA7125]/10 text-[#EA7125] border-[#EA7125]/15"
                          : "text-[#2C365E] hover:bg-[#2C365E]/5 hover:border-[#2C365E]/10"
                      )}
                      title={course.title}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            active ? "bg-[#EA7125]" : "bg-[#2C365E]/25"
                          )}
                        />
                        <span className="truncate">{course.title}</span>
                      </div>
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 pt-4 border-t border-[#EA7125]/12 bg-white/40 backdrop-blur">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onCustomize?.()
              mobileClose?.()
            }}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold",
              "bg-[#2C365E]/6 text-[#2C365E] border border-[#2C365E]/10",
              "hover:bg-[#2C365E]/10"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Customize Profile</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              "mt-2 flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold",
              "bg-red-500/10 text-red-600 border border-red-500/15",
              "hover:bg-red-500/15"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* --- Existing Modals --- */}
        <UploadContent
          open={activeModal === "upload"}
          onClose={() => setActiveModal(null)}
          onUploaded={() =>
            toast("Module uploaded", {
              description: "Your video module was successfully uploaded.",
            })
          }
        />

        <ProfileSettingsModal
          open={activeModal === "profile-settings"}
          onClose={() => setActiveModal(null)}
          onUpdated={() => {
            toast("Profile updated", { description: "Your changes have been saved." })
            onRefresh?.()
          }}
        />

        <CreateCourseModal
          open={activeModal === "new-course"}
          onClose={() => {
            setActiveModal(null)
            onRefresh?.()
          }}
          onCreated={(id) => {
            toast("Course created", { description: "New course is now active!" })
            setActiveModal(`manage-${id}`)
            onRefresh?.()
          }}
        />

        {(courses || []).map((course) => (
          <ManageCourseModal
            key={course.id}
            course={course}
            open={activeModal === `manage-${course.id}`}
            onClose={() => {
              setActiveModal(null)
              onRefresh?.()
            }}
            onUpdated={() => {
              toast("Course updated", { description: `Changes to "${course.title}" saved.` })
              onRefresh?.()
            }}
            onDeleted={() => {
              toast("Course deleted", { description: `"${course.title}" has been removed.` })
              setActiveModal(null)
              onRefresh?.()
            }}
          />
        ))}
      </aside>

      {/* --- New Modals --- */}
      <SimpleModal
        open={activeModal === "insights"}
        onClose={() => setActiveModal(null)}
        title="Creator Insights & Recommendations"
        icon={Lightbulb}
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <button
              onClick={copyInsights}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#2C365E] text-white hover:opacity-95"
            >
              <BadgeCheck className="h-4 w-4" />
              Copy Checklist
            </button>
            <button
              onClick={() => {
                setActiveModal("new-course")
                mobileClose?.()
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#EA7125] text-white hover:opacity-95"
            >
              <PlusCircle className="h-4 w-4" />
              Create Course
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
            <h4 className="font-bold text-[#2C365E] flex items-center gap-2">
              <Film className="h-4 w-4 text-[#EA7125]" />
              Movie-style structure (fast + high retention)
            </h4>
            <ul className="mt-2 text-sm text-[#2C365E]/80 space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Hook in first 10 seconds (problem + promise).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Value delivery 3–7 minutes (clear steps).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Proof (example / demo / before-after).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                CTA (next module + what to do now).
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
              <h4 className="font-bold text-[#2C365E] flex items-center gap-2">
                <Timer className="h-4 w-4 text-[#7C3AED]" />
                Video length sweet spot
              </h4>
              <p className="text-sm text-[#2C365E]/75 mt-2">
                Aim for <span className="font-semibold">5–20 minutes</span>. Short enough to finish,
                long enough to feel premium.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
              <h4 className="font-bold text-[#2C365E] flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-[#EA7125]" />
                Minimum content rule
              </h4>
              <p className="text-sm text-[#2C365E]/75 mt-2">
                Publish only when the course has <span className="font-semibold">3+ modules</span>.
                Learners convert + complete more.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
            <h4 className="font-bold text-[#2C365E] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#66A569]" />
              Quiz review (before publish)
            </h4>
            <ul className="mt-2 text-sm text-[#2C365E]/80 space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                One correct answer only (no ambiguity).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Avoid duplicate choices or trick wording.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Keep questions short — test understanding, not memory.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
            <h4 className="font-bold text-[#2C365E] flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-[#2C365E]" />
              Quality checklist
            </h4>
            <ul className="mt-2 text-sm text-[#2C365E]/80 space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Strong thumbnail per module (click-through).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Captions + transcript (accessibility + clarity).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                End each module with “Next step” to pull learners forward.
              </li>
            </ul>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        open={activeModal === "monetization"}
        onClose={() => setActiveModal(null)}
        title="Monetization & Monetary Management"
        icon={DollarSign}
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <button
              onClick={() => {
                toast("Tip saved", { description: "Use a single clear offer: Free intro + paid deep dive." })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#2C365E] text-white hover:opacity-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Tip
            </button>
            <button
              onClick={() => {
                setActiveModal("dashboard")
                mobileClose?.()
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#EA7125] text-white hover:opacity-95"
            >
              <BookOpen className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
            <h4 className="font-bold text-[#2C365E]">Pricing (simple & effective)</h4>
            <div className="mt-2 text-sm text-[#2C365E]/80 space-y-2">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Start with 1 paid offer per course: <span className="font-semibold">Starter</span> or{" "}
                <span className="font-semibold">Pro</span> (avoid too many tiers early).
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Use a free “Module 1 preview” style hook, then upsell depth.
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                Pricing rule of thumb: if it saves time or makes money, price higher.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
              <h4 className="font-bold text-[#2C365E]">Revenue levers</h4>
              <ul className="mt-2 text-sm text-[#2C365E]/80 space-y-1.5">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  Better thumbnails → more clicks.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  3+ modules → more completion.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  Clear CTA → more conversions.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
              <h4 className="font-bold text-[#2C365E]">Payout checklist</h4>
              <ul className="mt-2 text-sm text-[#2C365E]/80 space-y-1.5">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  Confirm payout method + account details.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  Review pricing before publishing.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#66A569] mt-0.5" />
                  Track top course → double down content.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
            <h4 className="font-bold text-[#2C365E]">Next best move</h4>
            <p className="text-sm text-[#2C365E]/80 mt-2">
              Make one course your “flagship”: add 5–8 strong modules, refine quizzes, and optimize thumbnail/captions.
            </p>
          </div>
        </div>
      </SimpleModal>
    </>
  )
}
