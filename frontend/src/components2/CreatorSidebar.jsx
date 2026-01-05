import React from "react"
import { Home, BookOpen, Upload, Settings, LogOut, PlusCircle, X } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import ProfileSettingsModal from "./ProfileSettingsModal"
import UploadContent from "@/creator/UploadContent"
import CreateCourseModal from "@/components2/CreateCourseModal"
import ManageCourseModal from "./ManageCourseModal"

const navItems = [
  { label: "Dashboard", icon: Home, action: "dashboard" },
  { label: "Profile Settings", icon: Settings, action: "profile-settings" },
]

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

  return (
    <aside
      className={cn(
        // ✅ HARD WIDTH CAP (never stretch wider)
        "min-w-[400px] max-w-[400px] shrink-0",
        "h-full flex flex-col",
        // ✅ Glass + subtle tech gradients (keep your brand colors)
        "bg-white/70 backdrop-blur-xl",
        "border-r border-[#EA7125]/15",
        "shadow-[0_10px_30px_rgba(44,54,94,0.08)]",
        "relative"
      )}
    >
      {/* Top glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/40 to-transparent" />

      {/* Mobile Close Button */}
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
            <BookOpen className="h-5 w-5 text-[#EA7125]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-[#2C365E] leading-tight">
              Creator Hub
            </h2>
            <p className="text-xs text-[#2C365E]/60 truncate">
              Manage courses, modules, and profile
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
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

              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#EA7125] shadow-[0_0_0_4px_rgba(234,113,37,0.15)]" />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Courses Section */}
      <div className="px-3 mt-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[11px] font-semibold text-[#2C365E]/70 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            My Courses
          </h3>

          {/* Primary add */}
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

        {/* Courses list container */}
        <div className="rounded-2xl border border-white/20 bg-white/55 backdrop-blur p-2 min-h-0 flex flex-col">
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
            {isEmpty ? (
              <div className="rounded-xl border border-dashed border-[#2C365E]/15 bg-white/40 p-4">
                <p className="text-sm font-medium text-[#2C365E]">No courses yet</p>
                <p className="text-xs text-[#2C365E]/60 mt-1">
                  Create your first course to start uploading modules.
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
                      <span className={cn("h-2 w-2 rounded-full", active ? "bg-[#EA7125]" : "bg-[#2C365E]/25")} />
                      <span className="truncate">{course.title}</span>
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
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
          onClick={() => {
            // prefer provided onLogout if you have it
            if (onLogout) return onLogout()

            localStorage.clear()
            toast.success("Logged out successfully")
            window.location.href = "/login"
          }}
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

      {/* Modals */}
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
  )
}

// local cn import safety (since your snippet didn't include it at top)
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
