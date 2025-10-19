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
import { getUserCourses, getMe } from '@/services/auth';



// ---------- Brand palette (subtle, low-contrast-friendly) ----------
const BRAND = {
  absoluteBlack: '#000000',
  blackOlive:   '#3B3C36',
  ivory:        '#FAF9F6',
  apple:        '#8DB600',
  heritage:     '#C1272D',
  burnt:        '#EE964B',
  navy:         '#2C365E',
}

// small helper to add alpha to hex colors
const withA = (hex, a = 0.1) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// app palettes user can select (keys must match your templates)
const PALETTES = ['color-1', 'color-2']

// ---- placeholder art for theme cards (swap when ready) ----
const THEME_CARDS = [
  {
    key: 'theme-1',
    title: 'Bento',
    cover: 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.00_PM_uxooid.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.00_PM_uxooid.png',
      'color-2': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.18_PM_j1uaxp.png',
    },
  },
  {
    key: 'theme-2',
    title: 'Minimalistic',
    cover: 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838830/Screenshot_2025-10-18_at_9.53.28_PM_kxlcxf.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838830/Screenshot_2025-10-18_at_9.53.28_PM_kxlcxf.png',
      'color-2': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838826/Screenshot_2025-10-18_at_9.52.38_PM_sbnkga.png',
    },
  },
  {
    key: 'theme-3',
    title: 'Glassmorphism',
    cover: 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.43_PM_xa8vpu.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838825/Screenshot_2025-10-18_at_9.51.43_PM_xa8vpu.png',
      'color-2': 'https://res.cloudinary.com/dyeomcmin/image/upload/v1760838826/Screenshot_2025-10-18_at_9.52.00_PM_sm2rrx.png',
    },
  },
]

const PRESET_BANNERS = [
  'https://res.cloudinary.com/dyeomcmin/image/upload/v1740689851/Geometric_abstract_art_marbling_colorful_wtiqv6.png',
  'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688147/2_ciw0y5.png',
  'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688148/bg3_ywoj4e.svg',
  'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688151/bgx_rt6jgw.png',
]

// Slide variants with direction
const slide = {
  enter: (dir) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: 'easeOut' } },
  exit:  (dir) => ({ x: dir > 0 ? 72 : -72, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }),
}

const StepBadge = ({ index, active, done, label }) => (
  <div className="flex items-center gap-3">
    <div
      className={[
        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-black',
        active ? 'text-white shadow' : done ? 'text-white' : '',
        'border backdrop-blur text-black',
      ].join(' ')}
      style={{
        background: active ? withA(BRAND.apple, 0.9) : done ? withA(BRAND.navy, 0.7) : withA(BRAND.ivory, 0.3),
        borderColor: withA(BRAND.blackOlive, 0.15),
      }}
    >
      {done ? '✓' : index}
    </div>
    <span className="text-sm" style={{ color: active ? '#fff' : 'rgba(255,255,255,.85)' }}><a className='text-black text-base'>{label}</a></span>
  </div>
)


export default function CreatorOnboarding() {
  const [step, setStep] = useState(1)          // 1..5
  const [dir, setDir] = useState(1)            // motion direction
  const [checkingBanner, setCheckingBanner] = useState(true)

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
  // Add this state for fresh user data
  const [freshUserData, setFreshUserData] = useState(null);
  const [loadingFreshData, setLoadingFreshData] = useState(false);

  useEffect(() => {
    const fetchFreshUserData = async () => {
      if (step === 5) {
        setLoadingFreshData(true);
        try {
          const [userData, coursesData] = await Promise.all([
            getMe(),
            getUserCourses()
          ]);
          
          setFreshUserData({
            user: userData,
            courses: coursesData
          });
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
        } finally {
          setLoadingFreshData(false);
        }
      }
    };
  
    fetchFreshUserData();
  }, [step]);
  useEffect(() => {
    // If user is already configured, you could skip steps here.
  }, [user])

  const paletteBoolean = useMemo(() => paletteKey === 'color-2', [paletteKey])

  const go = (to) => { setDir(to > step ? 1 : -1); setStep(to) }
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

  useEffect(() => {
    // If user already has a banner, skip onboarding and go to dashboard
    if (user?.banner_url) {
      navigate('/creator/dashboard', { replace: true })
    }
    setCheckingBanner(false)
  }, [user, navigate])


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
  const viewData = useMemo(() => {
    // Use fresh data if available, otherwise fall back to existing data
    const dataSource = freshUserData || { user, courses: [] };
    const currentUser = dataSource.user || user;
    const userCourses = dataSource.courses || user?.courses || [];
  
    return {
      creator: {
        id: currentUser?.id || 1,
        full_name: currentUser?.full_name || 'Your Name',
        bio: bio || currentUser?.bio || 'Creating meaningful learning experiences.',
        profile_image_url: currentUser?.profile_image_url || 'https://placehold.co/160x160',
        banner_url: bannerUrl || currentUser?.banner_url || '',
        theme: theme,
        color: paletteBoolean,
        slug: currentUser?.slug || 'creator',
        language: language || currentUser?.language || 'en',
        created_at: currentUser?.created_at
      },
      courses: userCourses.map(course => ({
        id: course.id,
        title: course.title || 'Sample Course',
        description: course.description || 'Comprehensive learning experience',
        student_count: course.student_count || 0,
        professor_name: currentUser?.full_name,
        module_count: course.module_count || 0,
        duration: course.duration || 'Self-paced',
        level: course.level || 'All Levels',
        rating: course.rating || 4.8,
        price: course.price || 0,
        image_url: course.image_url || '',
        modules: course.modules || []
      })),
      template: theme,
      paletteKey: paletteKey,
      stats: {
        total_courses: userCourses.length,
        total_students: userCourses.reduce((sum, course) => sum + (course.student_count || 0), 0),
        average_rating: userCourses.length > 0 ? 
          userCourses.reduce((sum, course) => sum + (course.rating || 4.8), 0) / userCourses.length : 4.8,
        completion_rate: 85
      },
      highlights: [
        { title: 'Expert Educator', desc: 'Years of teaching experience' },
        { title: 'Student Focused', desc: 'Proven track record of student success' },
        { title: 'Quality Content', desc: 'Carefully crafted learning materials' },
      ],
      links: [
        { label: 'Professional Profile', url: '#' },
        { label: 'Contact', url: '#' },
      ]
    };
  }, [freshUserData, user, bio, bannerUrl, theme, paletteKey, paletteBoolean, language]);
  
  const publicUrl = user?.slug ? `/creator/${user.slug}` : `/creator/${user?.id}`;

  if (checkingBanner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (

    
    <div className="relative min-h-[100svh]" style={{ background: BRAND.ivory }}>
      {/* Subtle layered backdrop (less gradient, more professional) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* ivory base */}
        <div className="absolute inset-0" style={{ background: BRAND.ivory }} />
        {/* faint radial tints */}
        <div
          className="absolute -top-24 -left-24 h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{ background: withA(BRAND.apple, 0.14) }}
        />
        <div
          className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: withA(BRAND.navy, 0.10) }}
        />
        {/* very light linear wash */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${withA(BRAND.burnt, 0.04)}, transparent 40%)` }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header + stepper */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND.blackOlive }}>Creator Onboarding</h1>
          <p style={{ color: withA(BRAND.blackOlive, 0.7) }}>Let’s set up your page in a few steps.</p>
        </div>

        <div>
          {/* Mobile - Shows only current step */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-baseline pl-4 "> 
              {step === 1 && <StepBadge index={1} label="Profile" active={true} done={false} mobile />}
              {step === 2 && <StepBadge index={2} label="Template" active={true} done={step > 2} mobile />}
              {step === 3 && <StepBadge index={3} label="Palette" active={true} done={step > 3} mobile />}
              {step === 4 && <StepBadge index={4} label="Banner" active={true} done={step > 4} mobile />}
              {step === 5 && <StepBadge index={5} label="Publish" active={true} done={false} mobile />}
            </div>
          </div>

          {/* Desktop - Shows all steps */}
          <div className="hidden lg:grid md:grid-cols-5 grid-cols-3 gap-4 mb-8">
            <StepBadge index={1} label="Profile" active={step === 1} done={step > 1} />
            <StepBadge index={2} label="Template" active={step === 2} done={step > 2} />
            <StepBadge index={3} label="Palette" active={step === 3} done={step > 3} />
            <StepBadge index={4} label="Banner" active={step === 4} done={step > 4} />
            <StepBadge index={5} label="Publish" active={step === 5} done={false} />
          </div>
        </div>
        {/* Card container */}
        <div
          className="rounded-2xl shadow-xl border p-6 md:p-8 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'saturate(140%) blur(6px)',
            WebkitBackdropFilter: 'saturate(140%) blur(6px)',
            borderColor: withA(BRAND.blackOlive, 0.12),
          }}
        >
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
                <h2 className="text-xl font-semibold" style={{ color: BRAND.navy }}>Your Profile</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium" style={{ color: BRAND.navy }}>Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell visitors who you are and what you publish…"
                      className="mt-2 w-full min-h-[110px] rounded-lg border p-3 focus:outline-none"
                      style={{
                        borderColor: withA(BRAND.navy, 0.2),
                        boxShadow: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: BRAND.navy }}>Preferred Language</label>
                    <select
                      className="mt-2 w-full rounded-lg border p-3 focus:outline-none"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{ borderColor: withA(BRAND.navy, 0.2) }}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ht">Kreyòl</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: BRAND.navy }}>Profile Image</label>
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
                  <Button
                    onClick={handleSaveProfile}
                    disabled={busy}
                    className="rounded-lg"
                    style={{
                      background: BRAND.absoluteBlack,
                      color: '#fff',
                    }}
                  >
                    {busy ? 'Saving…' : 'Continue'}
                  </Button>
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
                  <h2 className="text-xl font-semibold" style={{ color: BRAND.navy }}>Pick a Template</h2>
                  <span className="text-sm" style={{ color: withA(BRAND.navy, 0.7) }}>Click a card to reveal its palettes.</span>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {THEME_CARDS.map((t) => {
                    const isExpanded = expandedTheme === t.key
                    const isActive = theme === t.key
                    return (
                      <motion.div
                        key={t.key}
                        layout
                        className="rounded-xl border overflow-hidden bg-white shadow-sm"
                        style={{
                          borderColor: isActive ? withA(BRAND.apple, 0.0) : withA(BRAND.blackOlive, 0.12),
                          boxShadow: isActive ? `0 8px 26px ${withA(BRAND.apple, 0.18)}` : 'none',
                          outline: isActive ? `2px solid ${withA(BRAND.apple, 0.9)}` : 'none',
                          outlineOffset: isActive ? 0 : 0,
                        }}
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
                              <h3 className="font-semibold" style={{ color: BRAND.navy }}>{t.title}</h3>
                              {isActive && (
                                <span
                                  className="text-xs px-2 py-1 rounded"
                                  style={{ background: withA(BRAND.apple, 0.9), color: '#fff' }}
                                >
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-sm" style={{ color: withA(BRAND.navy, 0.7) }}>Modern, responsive layout</p>
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
                                    onClick={() => { setTheme(t.key); setPaletteKey(pk) }}
                                    className="rounded-lg border overflow-hidden hover:shadow transition"
                                    style={{
                                      borderColor:
                                        theme === t.key && paletteKey === pk
                                          ? withA(BRAND.apple, 0.0)
                                          : withA(BRAND.blackOlive, 0.12),
                                      outline:
                                        theme === t.key && paletteKey === pk
                                          ? `2px solid ${withA(BRAND.apple, 0.9)}`
                                          : 'none',
                                      outlineOffset: 0,
                                    }}
                                  >
                                    <img src={t.colors[pk]} alt={`${t.title}-${pk}`} className="w-full h-28 object-cover" />
                                    <div className="p-2 text-center text-xs" style={{ color: BRAND.navy }}>{pk}</div>
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
                  <Button
                    onClick={handleSaveTheme}
                    disabled={busy}
                    className="rounded-lg"
                    style={{ background: withA(BRAND.apple, 0.9), color: '#fff' }}
                  >
                    {busy ? 'Saving…' : 'Continue'}
                  </Button>
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
                  <h2 className="text-xl font-semibold" style={{ color: BRAND.navy }}>Pick a Color Palette</h2>
                  <select
                    className="rounded-md border p-2 text-sm"
                    value={paletteKey}
                    onChange={(e) => setPaletteKey(e.target.value)}
                    style={{ borderColor: withA(BRAND.navy, 0.2), color: BRAND.navy }}
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
                        className="rounded-xl border overflow-hidden bg-white hover:shadow transition"
                        style={{
                          borderColor: paletteKey === pk ? withA(BRAND.apple, 0.0) : withA(BRAND.blackOlive, 0.12),
                          outline: paletteKey === pk ? `2px solid ${withA(BRAND.apple, 0.9)}` : 'none',
                          outlineOffset: 0,
                        }}
                      >
                        <img src={themeCard.colors[pk]} alt={`${theme}-${pk}`} className="w-full h-56 object-cover" />
                        <div className="p-4 flex items-center justify-between">
                          <p className="font-medium" style={{ color: BRAND.navy }}>{pk}</p>
                          {paletteKey === pk && (
                            <span className="text-xs px-2 py-1 rounded" style={{ background: withA(BRAND.apple, 0.9), color: '#fff' }}>
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button
                    onClick={handleSavePalette}
                    disabled={busy}
                    className="rounded-lg"
                    style={{ background: withA(BRAND.apple, 0.9), color: '#fff' }}
                  >
                    {busy ? 'Saving…' : 'Continue'}
                  </Button>
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
                <h2 className="text-xl font-semibold" style={{ color: BRAND.navy }}>Banner</h2>
                <p className="text-sm" style={{ color: withA(BRAND.navy, 0.7) }}>Choose a preset or paste your image URL.</p>

                <div className="grid md:grid-cols-4 gap-4">
                  {PRESET_BANNERS.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerUrl(src)}
                      className="rounded-lg border overflow-hidden hover:shadow transition"
                      style={{
                        borderColor: bannerUrl === src ? withA(BRAND.apple, 0.0) : withA(BRAND.blackOlive, 0.12),
                        outline: bannerUrl === src ? `2px solid ${withA(BRAND.apple, 0.9)}` : 'none',
                        outlineOffset: 0,
                      }}
                    >
                      <img src={src} alt={`banner-${i}`} className="w-full h-28 object-cover" />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: BRAND.navy }}>Or paste a custom banner URL</label>
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://…"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button
                    onClick={handleSaveBanner}
                    disabled={busy || !bannerUrl}
                    className="rounded-lg"
                    style={{ background: withA(BRAND.apple, 0.9), color: '#fff' }}
                  >
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
                <h2 className="text-xl font-semibold" style={{ color: BRAND.navy }}>Publish</h2>
                <p className="text-sm" style={{ color: withA(BRAND.navy, 0.7) }}>
                  Preview your template with the current selections, then publish.
                </p>

                <div
                  className="rounded-xl overflow-hidden border shadow bg-white"
                  style={{ borderColor: withA(BRAND.blackOlive, 0.12) }}
                >
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
                    <span className="text-xs" style={{ color: withA(BRAND.blackOlive, 0.7) }}>
                      {publicUrl ? `/${publicUrl.replace(/^\//, '')}` : 'Your page will have a URL after publish.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button
                    onClick={handlePublish}
                    disabled={busy}
                    className="rounded-lg"
                    style={{ background: BRAND.absoluteBlack, color: '#fff' }}
                  >
                    {busy ? 'Publishing…' : 'Publish'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
