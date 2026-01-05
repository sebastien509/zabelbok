
// CreatorCustomizeModal.jsx
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog"
import { Button } from "@/components2/ui/button"
import { Input } from "@/components2/ui/input"
import { toast } from "@/components2/ui/use-toast"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"
import { updateStyle } from "@/services/auth"
import { useAuth } from "@/components/auth/AuthProvider"

// ---------- Brand palette ----------
const BRAND = {
  apple: "#66A569",
  burnt: "#EA7125",
  navy: "#2C365E",
  blackOlive: "#3B3C36",
}

const withA = (hex, a = 0.1) => {
  const h = hex.replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16)
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const PALETTES = ["color-1", "color-2"]

const THEME_CARDS = [
  {
    key: "theme-1",
    title: "Bento",
    cover:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.00_PM_uxooid.png",
    colors: {
      "color-1":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.00_PM_uxooid.png",
      "color-2":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.18_PM_j1uaxp.png",
    },
  },
  {
    key: "theme-2",
    title: "Minimalistic",
    cover:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838830/Screenshot_2025-10-18_at_9.53.28_PM_kxlcxf.png",
    colors: {
      "color-1":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838830/Screenshot_2025-10-18_at_9.53.28_PM_kxlcxf.png",
      "color-2":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838826/Screenshot_2025-10-18_at_9.52.38_PM_sbnkga.png",
    },
  },
  {
    key: "theme-3",
    title: "Glassmorphism",
    cover:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.43_PM_xa8vpu.png",
    colors: {
      "color-1":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.43_PM_xa8vpu.png",
      "color-2":
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760838826/Screenshot_2025-10-18_at_9.52.00_PM_sm2rrx.png",
    },
  },
]

const PRESET_BANNERS = [
  "https://res.cloudinary.com/dyeomcmin/image/upload/v1740689851/Geometric_abstract_art_marbling_colorful_wtiqv6.png",
  "https://res.cloudinary.com/dyeomcmin/image/upload/v1740688147/2_ciw0y5.png",
  "https://res.cloudinary.com/dyeomcmin/image/upload/v1740688148/bg3_ywoj4e.svg",
  "https://res.cloudinary.com/dyeomcmin/image/upload/v1740688151/bgx_rt6jgw.png",
]

const slide = {
  enter: (dir) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }),
}

function StepPill({ i, label, active, done }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <div
        className={[
          "h-9 w-9 rounded-full flex items-center justify-center text-xs font-black border",
          active ? "text-white" : done ? "text-white" : "text-[#2C365E]",
        ].join(" ")}
        style={{
          background: active ? withA(BRAND.burnt, 0.92) : done ? withA(BRAND.apple, 0.85) : "rgba(255,255,255,0.70)",
          borderColor: withA(BRAND.blackOlive, 0.14),
          boxShadow: active ? `0 10px 30px ${withA(BRAND.burnt, 0.18)}` : "none",
        }}
      >
        {done ? "✓" : i}
      </div>
      <div className="text-sm font-semibold text-center" style={{ color: BRAND.navy }}>
        {label}
      </div>
    </div>
  )
}

export default function CreatorCustomizeModal({ open, onClose, onConfirm }) {
  const { user, refreshUser } = useAuth()

  const [step, setStep] = useState(1) // 1..3
  const [dir, setDir] = useState(1)
  const [busy, setBusy] = useState(false)

  const [theme, setTheme] = useState("theme-1")
  const [paletteKey, setPaletteKey] = useState("color-1")
  const [expandedTheme, setExpandedTheme] = useState("theme-1")

  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0])
  const [bannerInput, setBannerInput] = useState("")
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const paletteBoolean = useMemo(() => paletteKey === "color-2", [paletteKey])

  const publicUrl = useMemo(() => {
    if (!user) return ""
    return user?.slug ? `/creator/${user.slug}` : user?.id ? `/creator/${user.id}` : ""
  }, [user])

  const go = (to) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  const next = () => go(Math.min(3, step + 1))
  const back = () => go(Math.max(1, step - 1))

  useEffect(() => {
    if (!open) return
    const uTheme = user?.theme || "theme-1"
    const uPalette = user?.color ? "color-2" : "color-1"
    const uBanner = user?.banner_url || PRESET_BANNERS[0]

    setTheme(uTheme)
    setExpandedTheme(uTheme)
    setPaletteKey(uPalette)
    setBannerUrl(uBanner)
    setBannerInput(uBanner || "")
    setStep(1)
    setDir(1)
  }, [open, user])

  const handleBannerFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const url = await uploadToCloudinary(file)
      setBannerUrl(url)
      setBannerInput(url)
      toast({ title: "Banner uploaded", description: "Your new banner is ready." })
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err?.message || "Could not upload banner.",
        variant: "destructive",
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  const applyBannerInput = () => {
    if (!bannerInput?.trim()) return
    const u = bannerInput.trim()
    setBannerUrl(u)
    toast({ title: "Banner selected", description: "Using your custom banner URL." })
  }

  const handleApplyAndView = async () => {
    if (!theme || !paletteKey || !bannerUrl) {
      toast({
        title: "Missing info",
        description: "Please pick a template, palette, and banner.",
        variant: "destructive",
      })
      return
    }

    setBusy(true)
    try {
      await updateStyle({ theme, color: paletteBoolean, banner_url: bannerUrl })
      await refreshUser?.()
      toast({ title: "Applied", description: "Opening your creator page..." })
      onConfirm?.({ theme, paletteKey, banner_url: bannerUrl })
      onClose?.()
      if (publicUrl) window.open(publicUrl, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Could not save your style.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ 10% smaller overall (w-1/10 smaller): 92vw -> 82vw, 92vh -> 84vh */}
      <DialogContent className="!w-[82vw] !max-w-[82vw] h-[84vh] max-h-[84vh] overflow-hidden p-0">
        <div className="relative h-full overflow-hidden rounded-2xl">
          {/* Subtle tech background */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(44,54,94,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,54,94,0.35)_1px,transparent_1px)] bg-[size:22px_22px] animate-[gridMove_12s_linear_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,113,37,0.22),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(102,165,105,0.18),transparent_45%)]" />
          </div>

          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <DialogHeader className="items-center text-center">
                <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-[#2C365E] text-center">
                  Customize Your Creator Page
                </DialogTitle>
                <DialogDescription className="text-[#2C365E]/70 text-center">
                  Update your template, colors, and banner.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
                <StepPill i={1} label="Template" active={step === 1} done={step > 1} />
                <StepPill i={2} label="Palette" active={step === 2} done={step > 2} />
                <StepPill i={3} label="Banner" active={step === 3} done={false} />
              </div>
            </div>

{/* Body */}
<div className="flex-1 overflow-y-auto px-6 pb-8">
  {/* ✅ Center + allow bigger max width for “max width to show” */}
  <div className="max-w-[92rem] mx-auto">
    <div
      className="rounded-2xl border p-5 sm:p-6 bg-white/75 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] text-center"
      style={{ borderColor: withA(BRAND.blackOlive, 0.12) }}
    >
      <AnimatePresence mode="wait" custom={dir}>
        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#2C365E] text-center">
                Choose a Template
              </h3>
              <span className="text-xs font-semibold text-[#2C365E]/60 text-center">
                Click a card to select
              </span>
            </div>

            {/* ✅ wider cards + fewer columns so each card is BIG */}
            <div className="grid gap-6 place-items-center grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {THEME_CARDS.map((t) => {
                const active = theme === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTheme(t.key)
                      setExpandedTheme(t.key)
                    }}
                    className="group w-full  rounded-2xl overflow-hidden border bg-white/70 backdrop-blur hover:shadow-[0_18px_55px_rgba(0,0,0,0.14)] transition text-center"
                    style={{
                      borderColor: active
                        ? withA(BRAND.burnt, 0.35)
                        : withA(BRAND.blackOlive, 0.12),
                      outline: active ? `2px solid ${withA(BRAND.burnt, 0.55)}` : "none",
                      outlineOffset: 0,
                    }}
                  >
                    <div className="relative">
                      {/* ✅ make template previews taller & “max width to show” */}
                      <img
                        src={t.cover}
                        alt={t.title}
                        className="h-56 sm:h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="text-white text-lg font-extrabold">{t.title}</div>
                        {active && (
                          <div className="rounded-full px-2 py-1 text-[11px] font-bold bg-[#EA7125]/90 text-white border border-white/20">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 text-center">
                      <div className="text-sm font-semibold text-[#2C365E]">
                        Clean + conversion-ready
                      </div>
                      <div className="text-xs text-[#2C365E]/60 mt-1">
                        Optimized for mobile & sharing
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={next} className="rounded-xl">
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            key="step-2"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#2C365E] text-center">
                Choose a Palette
              </h3>
              <span className="text-xs font-semibold text-[#2C365E]/60 text-center">
                2 options per template
              </span>
            </div>

            {/* ✅ bigger palette cards, fewer columns */}
            <div className="grid gap-6 place-items-center grid-cols-1 lg:grid-cols-2">
              {PALETTES.map((pk) => {
                const t =
                  THEME_CARDS.find((x) => x.key === theme) ||
                  THEME_CARDS.find((x) => x.key === expandedTheme) ||
                  THEME_CARDS[0]
                const active = paletteKey === pk

                return (
                  <button
                    key={pk}
                    onClick={() => setPaletteKey(pk)}
                    className="w-full  rounded-2xl overflow-hidden border bg-white/70 hover:shadow-[0_18px_55px_rgba(0,0,0,0.14)] transition text-center"
                    style={{
                      borderColor: active
                        ? withA(BRAND.apple, 0.35)
                        : withA(BRAND.blackOlive, 0.12),
                      outline: active ? `2px solid ${withA(BRAND.apple, 0.6)}` : "none",
                      outlineOffset: 0,
                    }}
                  >
                    {/* ✅ show more of the UI screenshot */}
                    <img
                      src={t.colors[pk]}
                      alt={`${t.title}-${pk}`}
                      className="h-72 sm:h-80 w-full object-cover"
                    />
                    <div className="p-4 flex items-center justify-center gap-3">
                      <div className="text-sm sm:text-base font-extrabold text-[#2C365E]">
                        {pk}
                      </div>
                      {active && (
                        <div className="rounded-full px-2 py-1 text-[11px] font-bold bg-[#66A569]/15 text-[#66A569] border border-[#66A569]/20">
                          Selected
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button onClick={next} className="rounded-xl">
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div
            key="step-3"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#2C365E] text-center">
                Choose a Banner
              </h3>
              <span className="text-xs font-semibold text-[#2C365E]/60 text-center">
                Preset, URL, or upload
              </span>
            </div>

            {/* ✅ larger banner tiles + fewer columns */}
            <div className="grid gap-5 place-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_BANNERS.map((src) => {
                const active = bannerUrl === src
                return (
                  <button
                    key={src}
                    onClick={() => {
                      setBannerUrl(src)
                      setBannerInput(src)
                    }}
                    className="w-full  rounded-2xl overflow-hidden border bg-white/70 transition hover:shadow-[0_18px_55px_rgba(0,0,0,0.14)]"
                    style={{
                      borderColor: active
                        ? withA(BRAND.burnt, 0.35)
                        : withA(BRAND.blackOlive, 0.12),
                      outline: active ? `2px solid ${withA(BRAND.burnt, 0.55)}` : "none",
                      outlineOffset: 0,
                    }}
                  >
                    {/* ✅ show more banner */}
                    <img src={src} alt="banner" className="h-36 sm:h-44 w-full object-cover" />
                  </button>
                )
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-6 items-end">
              <div className="md:col-span-5 text-left mx-auto w-full">
                <label className="text-sm font-semibold text-[#2C365E] block text-center md:text-left">
                  Or paste a custom banner URL
                </label>
                <Input
                  value={bannerInput}
                  onChange={(e) => setBannerInput(e.target.value)}
                  placeholder="https://…"
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-1 flex md:justify-end justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyBannerInput}
                  className="w-full rounded-xl"
                >
                  Use URL
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/60 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
                <div className="mx-auto sm:mx-0">
                  <div className="text-sm font-extrabold text-[#2C365E]">Upload a banner</div>
                  <div className="text-xs text-[#2C365E]/60">
                    Recommended: wide image (1200×400+)
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFile}
                  className="max-w-[520px]"
                  disabled={uploadingBanner}
                />
              </div>
            </div>

            {/* ✅ banner preview max width FULL */}
            <div
              className="rounded-2xl overflow-hidden border mx-auto w-full max-w-[92rem]"
              style={{ borderColor: withA(BRAND.blackOlive, 0.12) }}
            >
              <div
                className="text-xs font-semibold px-3 py-2 bg-white/70 text-[#2C365E]/70 border-b text-center"
                style={{ borderColor: withA(BRAND.blackOlive, 0.1) }}
              >
                Banner preview
              </div>
              <img src={bannerUrl} alt="Selected banner" className="h-56 sm:h-72 w-full object-cover" />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button onClick={handleApplyAndView} disabled={busy || !bannerUrl} className="rounded-xl">
                {busy ? "Applying..." : "Apply & view Page"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</div>


            <style>{`
              @keyframes gridMove {
                0% { transform: translate3d(0,0,0); }
                100% { transform: translate3d(-22px,-22px,0); }
              }
            `}</style>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

