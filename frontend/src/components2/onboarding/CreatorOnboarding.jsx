// src/components2/onboarding/CreatorOnboarding.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login, updateProfile, updateStyle, checkSlugAvailable } from '@/services/auth'
import { useAuth } from '@/components/auth/AuthProvider'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { Button } from '@/components2/bento-UI/button'
import { toast } from '@/components2/bento-UI/use-toast'
import BasicStep from './BasicStep'
import ProfileStep from './ProfileStep'
import TemplateStep from './TemplateStep'
import PaletteStep from './PaletteStep'
import MediaStep from './MediaStep'
import PreviewPublishStep from './PreviewPublishStep'

const slugify = s => (s || '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g,'')
  .replace(/\s+/g,'-')
  .replace(/-+/g,'-') || 'user'

export default function CreatorOnboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  // draft state
  const [draft, setDraft] = useState({
    full_name: '',
    email: '',
    password: '',
    bio: '',
    language: 'en',
    profile_image_file: null,
    profile_image_url: '',
    template: 'theme-1',     // theme-1/2/3
    paletteKey: 'color-1',   // map to color boolean on publish
    banner_file: null,
    banner_url: '',
    slug: '',
    headline: 'Creator',
    links: [],
    highlights: [],
    ctaUrl: '',
    ctaText: 'Explore',
  })

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(1, s - 1))

  // 1) Register + Login
  const handleRegister = async () => {
    setLoading(true)
    try {
      await register({ full_name: draft.full_name, email: draft.email, password: draft.password, role: 'professor', school_id: 1 })
      const res = await login(draft.email, draft.password)
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user_id', res.user_id)
      await refreshUser()
      toast({ title: 'Signed up!', description: 'Welcome aboard.' })
      next()
    } catch (e) {
      toast({ title: 'Signup failed', description: 'Email may already be used.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // 2) Save basic profile (bio/lang/avatar)
  const handleProfileSave = async () => {
    setLoading(true)
    try {
      let avatar = draft.profile_image_url
      if (draft.profile_image_file) {
        avatar = await uploadToCloudinary(draft.profile_image_file)
      }
      await updateProfile({ bio: draft.bio, language: draft.language, profile_image_url: avatar })
      setDraft(d => ({ ...d, profile_image_url: avatar }))
      toast({ title: 'Profile updated' })
      next()
    } catch (e) {
      toast({ title: 'Could not save profile', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // 3–4) set template/palette locally; nothing to save yet
  const handleTemplatePick = (template) => setDraft(d => ({ ...d, template }))
  const handlePalettePick = (paletteKey) => setDraft(d => ({ ...d, paletteKey }))

  // 5) upload banner (optional)
  const handleMediaSave = async () => {
    setLoading(true)
    try {
      let banner = draft.banner_url
      if (draft.banner_file) banner = await uploadToCloudinary(draft.banner_file)
      setDraft(d => ({ ...d, banner_url: banner }))
      toast({ title: 'Media saved' })
      next()
    } catch (e) {
      toast({ title: 'Could not upload banner', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // 6) Preview + Publish (claim slug, save style)
  const handlePublish = async () => {
    setLoading(true)
    try {
      // claim slug (frontend proposes; backend enforces uniqueness)
      let base = draft.slug?.trim() || slugify(draft.full_name)
      if (!base) base = 'user'
      let candidate = base
      let i = 0
      // client-side check loop to reduce collisions
      // (backend will still 409 if lost the race)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { available } = await checkSlugAvailable(candidate)
        if (available) break
        i += 1
        candidate = `${base}-${i}`
      }

      // boolean color from paletteKey
      const colorBool = draft.paletteKey === 'color-2'

      await updateStyle({
        theme: draft.template,
        banner_url: draft.banner_url,
        color: colorBool,
        slug: candidate,
      })

      toast({ title: 'Published!', description: `Your page is live at /c/${candidate}` })
      navigate(`/creator/dashboard`) // or navigate(`/c/${candidate}`)
    } catch (e) {
      toast({ title: 'Publish failed', description: 'Try a different slug or try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] via-[#faf0e6] to-[#EA7125]/20">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-4 text-sm text-black/60">Step {step} of 6</div>
        <div className="rounded-2xl border bg-white/90 backdrop-blur shadow">
          <div className="p-6 md:p-8">
            {step === 1 && (
              <BasicStep
                value={draft}
                onChange={setDraft}
                loading={loading}
                onNext={handleRegister}
              />
            )}
            {step === 2 && (
              <ProfileStep
                value={draft}
                onChange={setDraft}
                loading={loading}
                onBack={back}
                onNext={handleProfileSave}
              />
            )}
            {step === 3 && (
              <TemplateStep
                template={draft.template}
                onPick={handleTemplatePick}
                onBack={back}
                onNext={next}
              />
            )}
            {step === 4 && (
              <PaletteStep
                template={draft.template}
                paletteKey={draft.paletteKey}
                onPick={handlePalettePick}
                onBack={back}
                onNext={next}
              />
            )}
            {step === 5 && (
              <MediaStep
                value={draft}
                onChange={setDraft}
                loading={loading}
                onBack={back}
                onNext={handleMediaSave}
              />
            )}
            {step === 6 && (
              <PreviewPublishStep
                value={draft}
                onChange={setDraft}
                loading={loading}
                onBack={back}
                onPublish={handlePublish}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
