import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components2/bento-UI/button'
import { Input } from '@/components2/ui/input'
import { toast } from '@/components2/bento-UI/use-toast'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { updateProfile, updateStyle } from '@/services/auth'
import { useAuth } from '@/components/auth/AuthProvider'
import { TemplateRenderer } from '@/components2/pages/template/index.jsx'

const PALETTES = ['color-1', 'color-2']

// ---- PLACEHOLDER art for theme cards (swap with real images anytime) ----
const THEME_CARDS = [
  {
    key: 'theme-1',
    title: 'Bento',
    cover: 'https://placehold.co/720x300?text=Bento+Cover',
    colors: {
      'color-1': 'https://placehold.co/640x240/3498db/fff?text=Bento+color-1',
      'color-2': 'https://placehold.co/640x240/e74c3c/fff?text=Bento+color-2',
    },
  },
  {
    key: 'theme-2',
    title: 'Minimalistic',
    cover: 'https://placehold.co/720x300?text=Minimalistic+Cover',
    colors: {
      'color-1': 'https://placehold.co/640x240/2ecc71/fff?text=Minimal+color-1',
      'color-2': 'https://placehold.co/640x240/f39c12/fff?text=Minimal+color-2',
    },
  },
  {
    key: 'theme-3',
    title: 'Glassmorphism',
    cover: 'https://placehold.co/720x300?text=Glassmorphism+Cover',
    colors: {
      'color-1': 'https://placehold.co/640x240/8e44ad/fff?text=Glass+color-1',
      'color-2': 'https://placehold.co/640x240/16a085/fff?text=Glass+color-2',
    },
  },
]

const PRESET_BANNERS = [
  'https://placehold.co/1200x360/2980b9/ffffff?text=Banner+1',
  'https://placehold.co/1200x360/27ae60/ffffff?text=Banner+2',
  'https://placehold.co/1200x360/c0392b/ffffff?text=Banner+3',
  'https://placehold.co/1200x360/f39c12/ffffff?text=Banner+4',
]

// Slide variants with direction
const slide = {
  enter: (dir) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: (dir) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  }),
}

const StepBadge = ({ index, active, done, label }) => (
  <div className="flex items-center gap-3">
    <div
      className={[
        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold',
        active ? 'bg-[#EA7125] text-white shadow' : done ? 'bg-emerald-500 text-white' : 'bg-white/60 text-[#2C365E]',
        'border border-white/30 backdrop-blur',
      ].join(' ')}
    >
      {done ? '✓' : index}
    </div>
    <span className={`text-sm ${active ? 'text-white' : 'text-white/80'}`}>{label}</span>
  </div>
)

export default function CreatorOnboarding() {
  const [step, setStep] = useState(1)          // 1..5
  const [dir, setDir] = useState(1)            // motion direction

  // profile fields
  const [bio, setBio] = useState('')
  const [language, setLanguage] = useState('en')
  const [avatar, setAvatar] = useState(null)

  // theme & palette
  const [theme, setTheme] = useState('theme-1')          // theme-1|2|3
  const [paletteKey, setPaletteKey] = useState('color-1')// color-1|2
  const [expandedTheme, setExpandedTheme] = useState('theme-1')

  // banner
  const [bannerUrl, setBannerUrl] = useState('')

  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    // optional: if user already has setup, skip onward
    // if (user?.bio && user?.theme && user?.banner_url) setStep(5)
  }, [user])

  const paletteBoolean = useMemo(() => paletteKey === 'color-2', [paletteKey])

  const go = (to) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  const next = () => go(Math.min(5, step + 1))
  const back = () => go(Math.max(1, step - 1))

  // API handlers
  const handleSaveProfile = async () => {
    setBusy(true)
    try {
      let profile_image_url = ''
      if (avatar) profile_image_url = await uploadToCloudinary(avatar)
      await updateProfile({ bio, language, profile_image_url })
      toast('Profile saved', { description: 'Nice bio—on to the fun parts!' })
      next()
    } catch {
      toast.error('Could not save profile', { description: 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const handleSaveTheme = async () => {
    setBusy(true)
    try {
      await updateStyle({ theme, color: paletteBoolean })
      toast('Template selected', { description: 'Pick a palette next.' })
      next()
    } catch {
      toast.error('Could not save template', { description: 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const handleSavePalette = async () => {
    setBusy(true)
    try {
      await updateStyle({ theme, color: paletteBoolean })
      toast('Palette applied', { description: 'Looking sharp.' })
      next()
    } catch {
      toast.error('Could not apply palette', { description: 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const handleSaveBanner = async () => {
    setBusy(true)
    try {
      await updateStyle({ theme, color: paletteBoolean, banner_url: bannerUrl })
      toast('Banner saved', { description: 'Preview time!' })
      next()
    } catch {
      toast.error('Could not save banner', { description: 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const handlePublish = async () => {
    setBusy(true)
    try {
      await refreshUser()
      toast('All set!', { description: 'Your public page is live.' })
      navigate('/creator/dashboard', { replace: true })
    } catch {
      toast.error('Publish failed', { description: 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  // ---- Preview data for TemplateRenderer (Step 5) ----
  const viewData = useMemo(() => ({
    name: user?.full_name ?? 'Your Name',
    headline: 'Creator & Educator',
    bio: bio || user?.bio || 'Short bio goes here.',
    avatarUrl: user?.profile_image_url || 'https://placehold.co/160x160',
    bannerUrl: bannerUrl || user?.banner_url || '',
    ctaUrl: '#',
    ctaText: 'View Portfolio',
    links: [
      { label: 'Website', url: '#' },
      { label: 'YouTube', url: '#' },
      { label: 'Twitter', url: '#' },
    ],
    highlights: [
      { title: '10+ Courses', desc: 'Across STEM & design' },
      { title: '5k+ Learners', desc: 'Taught globally' },
      { title: 'Top Rated', desc: '4.9/5 average' },
    ],
  }), [user, bio, bannerUrl])

  const publicUrl = user?.slug ? `/creator/${user.slug}` : null

  return (
    <div className="relative min-h-[100svh]">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C365E] via-[#3f4975] to-[#EA7125] opacity-90" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl"
          animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header + stepper */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Creator Onboarding</h1>
          <p className="text-white/80">Let’s set up your page in a few steps.</p>
        </div>

        <div className="grid md:grid-cols-5 grid-cols-3 gap-4 mb-8">
          <StepBadge index={1} label="Profile"  active={step === 1} done={step > 1} />
          <StepBadge index={2} label="Template" active={step === 2} done={step > 2} />
          <StepBadge index={3} label="Palette"  active={step === 3} done={step > 3} />
          <StepBadge index={4} label="Banner"   active={step === 4} done={step > 4} />
          <StepBadge index={5} label="Publish"  active={step === 5} done={false} />
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/30 p-6 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-[#2C365E]">Your Profile</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-[#2C365E]">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell visitors who you are and what you publish…"
                      className="mt-2 w-full min-h-[110px] rounded-lg border border-[#2C365E]/20 p-3 focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2C365E]">Preferred Language</label>
                    <select
                      className="mt-2 w-full rounded-lg border border-[#2C365E]/20 p-3 focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ht">Kreyòl</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2C365E]">Profile Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={back} disabled>Back</Button>
                  <Button onClick={handleSaveProfile} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2C365E]">Pick a Template</h2>
                  <span className="text-sm text-[#2C365E]/70">Click a card to reveal its two color palettes.</span>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {THEME_CARDS.map((t) => {
                    const isExpanded = expandedTheme === t.key
                    const isActive = theme === t.key
                    return (
                      <motion.div
                        key={t.key}
                        layout
                        className={[
                          'rounded-xl border overflow-hidden bg-white shadow-sm',
                          isActive ? 'ring-2 ring-[#EA7125] border-transparent' : 'border-[#2C365E]/10',
                        ].join(' ')}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            setExpandedTheme(t.key)
                            setTheme(t.key)
                          }}
                        >
                          <img src={t.cover} alt={t.title} className="w-full h-44 object-cover" />
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-[#2C365E]">{t.title}</h3>
                              {isActive && <span className="text-xs bg-[#EA7125] text-white px-2 py-1 rounded">Selected</span>}
                            </div>
                            <p className="text-sm text-[#2C365E]/70 mt-1">Modern, responsive layout</p>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key={`${t.key}-colors`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                {PALETTES.map((pk) => (
                                  <button
                                    key={pk}
                                    onClick={() => {
                                      setTheme(t.key)
                                      setPaletteKey(pk)
                                    }}
                                    className={[
                                      'rounded-lg border overflow-hidden hover:shadow transition',
                                      theme === t.key && paletteKey === pk
                                        ? 'ring-2 ring-[#EA7125] border-transparent'
                                        : 'border-[#2C365E]/10',
                                    ].join(' ')}
                                  >
                                    <img src={t.colors[pk]} alt={`${t.title}-${pk}`} className="w-full h-28 object-cover" />
                                    <div className="p-2 text-center text-xs text-[#2C365E]">{pk}</div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSaveTheme} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2C365E]">Pick a Color Palette</h2>
                  <select
                    className="rounded-md border border-[#2C365E]/20 p-2 text-sm"
                    value={paletteKey}
                    onChange={(e) => setPaletteKey(e.target.value)}
                  >
                    <option value="color-1">color-1 (default)</option>
                    <option value="color-2">color-2</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {PALETTES.map((pk) => {
                    const themeCard = THEME_CARDS.find((t) => t.key === theme)
                    if (!themeCard) return null
                    return (
                      <button
                        key={pk}
                        onClick={() => setPaletteKey(pk)}
                        className={[
                          'rounded-xl border overflow-hidden bg-white',
                          paletteKey === pk ? 'ring-2 ring-[#EA7125] border-transparent shadow' : 'border-[#2C365E]/10',
                          'hover:shadow transition',
                        ].join(' ')}
                      >
                        <img src={themeCard.colors[pk]} alt={`${theme}-${pk}`} className="w-full h-56 object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-[#2C365E]">{pk}</p>
                            {paletteKey === pk && <span className="text-xs bg-[#EA7125] text-white px-2 py-1 rounded">Selected</span>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSavePalette} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-[#2C365E]">Banner</h2>
                <p className="text-sm text-[#2C365E]/70">Choose a preset or paste your image URL.</p>

                <div className="grid md:grid-cols-4 gap-4">
                  {PRESET_BANNERS.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerUrl(src)}
                      className={[
                        'rounded-lg border overflow-hidden hover:shadow transition',
                        bannerUrl === src ? 'ring-2 ring-[#EA7125] border-transparent' : 'border-[#2C365E]/10',
                      ].join(' ')}
                    >
                      <img src={src} alt={`banner-${i}`} className="w-full h-28 object-cover" />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium text-[#2C365E]">Or paste a custom banner URL</label>
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://…"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSaveBanner} disabled={busy || !bannerUrl}>
                    {busy ? 'Saving…' : 'Continue'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-[#2C365E]">Publish</h2>
                <p className="text-sm text-[#2C365E]/70">Preview your actual template with your current selections, then publish.</p>

                <div className="rounded-xl overflow-hidden border border-[#2C365E]/10 shadow bg-white">
                  <div className="p-0">
                    <TemplateRenderer template={theme} paletteKey={paletteKey} data={viewData} />
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => publicUrl && navigate(publicUrl)}
                      disabled={!publicUrl}
                    >
                      Visit Public Page
                    </Button>
                    <span className="text-xs text-[#2C365E]/60">
                      {publicUrl ? `/${publicUrl.replace(/^\//, '')}` : 'Your page will have a public URL after publish.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handlePublish} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
