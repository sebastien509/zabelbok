import { Loader2, CheckCircle, FileText, ClipboardList, UploadCloud } from "lucide-react"
import { motion } from "framer-motion"

export default function UploadModuleLoading({ currentStep = "uploading" }) {
  const steps = [
    {
      id: "uploading",
      label: "Uploading Video",
      icon: <UploadCloud className="h-5 w-5" />,
      description: "Sending your video to our servers",
    },
    {
      id: "transcribing",
      label: "Generating Transcript",
      icon: <FileText className="h-5 w-5" />,
      description: "Creating text captions from your video",
    },
    {
      id: "quiz",
      label: "Creating Quiz",
      icon: <ClipboardList className="h-5 w-5" />,
      description: "Generating assessment questions",
    },
    {
      id: "complete",
      label: "Processing Complete",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Finalizing your module",
    },
    {
      id: "publishing",
      label: "Publishing Module",
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      description: "Making your module available to students",
    },
  ]

  const order = steps.map((s) => s.id)
  const activeIndex = Math.max(0, order.indexOf(currentStep))
  const progressPct = ((activeIndex + 1) / order.length) * 100

  const isCompleteStep = (stepId) => order.indexOf(stepId) < activeIndex
  const isActiveStep = (stepId) => stepId === currentStep

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
        {/* Subtle animated grid background (pure CSS) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(44,54,94,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,54,94,0.35)_1px,transparent_1px)] bg-[size:22px_22px] animate-[gridMove_12s_linear_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,113,37,0.25),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(102,165,105,0.20),transparent_45%)]" />
        </div>

        {/* top glow line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EA7125]/45 to-transparent" />

        {/* progress bar */}
        <div className="relative px-6 pt-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[#2C365E]">Processing module</div>
            <div className="text-xs font-semibold text-[#2C365E]/60">
              Step {activeIndex + 1}/{order.length}
            </div>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-[#2C365E]/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "rgba(234,113,37,0.92)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        {/* steps */}
        <div className="relative px-4 pb-5 pt-4 space-y-2">
          {steps.map((step) => {
            const active = isActiveStep(step.id)
            const done = isCompleteStep(step.id)

            return (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0.85, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={[
                  "flex items-start gap-3 rounded-2xl border p-3.5 transition",
                  "bg-white/55 backdrop-blur-xl",
                  active
                    ? "border-[#EA7125]/25 shadow-[0_10px_30px_rgba(234,113,37,0.10)]"
                    : "border-white/15",
                ].join(" ")}
              >
                {/* icon bubble + rotating ring when active */}
                <div className="relative mt-0.5 h-10 w-10 shrink-0">
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute -inset-[6px] rounded-[16px] border border-[#EA7125]/35 animate-[spinSlow_1.6s_linear_infinite]"
                      style={{
                        background:
                          "conic-gradient(from 0deg, rgba(234,113,37,0.00), rgba(234,113,37,0.55), rgba(234,113,37,0.00))",
                        maskImage:
                          "linear-gradient(#000,#000), linear-gradient(#000,#000)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: "1px",
                      }}
                    />
                  )}

                  <div
                    className={[
                      "absolute inset-0 rounded-xl flex items-center justify-center border",
                      active
                        ? "bg-[#EA7125]/10 border-[#EA7125]/20"
                        : done
                        ? "bg-[#66A569]/10 border-[#66A569]/20"
                        : "bg-[#2C365E]/[0.06] border-white/15",
                    ].join(" ")}
                  >
                    {active ? (
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#EA7125" }} />
                    ) : done ? (
                      <CheckCircle className="h-5 w-5" style={{ color: "#66A569" }} />
                    ) : (
                      <span className="text-[#2C365E]">{step.icon}</span>
                    )}
                  </div>
                </div>

                {/* text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={[
                        "text-sm font-bold truncate",
                        active ? "text-[#2C365E]" : "text-[#2C365E]/85",
                      ].join(" ")}
                    >
                      {step.label}
                    </h3>

                    {done && (
                      <span className="text-[11px] font-semibold rounded-full px-2 py-1 border border-[#66A569]/20 bg-[#66A569]/10 text-[#66A569]">
                        Done
                      </span>
                    )}

                    {active && (
                      <span className="text-[11px] font-semibold rounded-full px-2 py-1 border border-[#EA7125]/20 bg-[#EA7125]/10 text-[#EA7125]">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#2C365E]/60 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Local CSS keyframes (pure CSS, no images) */}
        <style>{`
          @keyframes gridMove {
            0% { transform: translate3d(0,0,0); }
            100% { transform: translate3d(-22px,-22px,0); }
          }
          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
