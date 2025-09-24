// src/components2/onboarding/steps/PreviewPublishStep.jsx
import { useMemo, useState } from 'react'
import { Input } from '@/components2/ui/input'
import { Button } from '@/components2/bento-UI/button'
import { TemplateRenderer } from '@/components2/pages/template/index.jsx'
import { checkSlugAvailable } from '@/services/auth'

const slugify = s => (s || '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g,'')
  .replace(/\s+/g,'-')
  .replace(/-+/g,'-') || 'user'

export default function PreviewPublishStep({ value, onChange, loading, onBack, onPublish }) {
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(null)

  const data = useMemo(() => ({
    name: value.full_name || 'Creator',
    headline: value.headline || 'Creator',
    bio: value.bio || '',
    avatarUrl: value.profile_image_url,
    bannerUrl: value.banner_url,
    ctaUrl: value.ctaUrl || '#',
    ctaText: value.ctaText || 'Explore',
    links: value.links || [],
    highlights: value.highlights || [],
  }), [value])

  const set = (k, v) => onChange(d => ({ ...d, [k]: v }))

  const propose = slugify(value.slug || value.full_name)
  const disabled = loading || checking || !propose

  const doCheck = async () => {
    setChecking(true)
    try {
      const { available } = await checkSlugAvailable(propose)
      setAvailable(available)
      if (available) set('slug', propose)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preview & publish</h2>

      <div className="rounded-xl border overflow-hidden">
        <div className="scale-[0.8] origin-top-left w-[125%]">
          <TemplateRenderer template={value.template} paletteKey={value.paletteKey} data={data} />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Your public URL slug</label>
        <div className="flex gap-2">
          <Input
            value={propose}
            onChange={e=>set('slug', e.target.value)}
            placeholder="your-name"
          />
          <Button variant="outline" onClick={doCheck} disabled={checking}>
            {checking ? 'Checking…' : 'Check'}
          </Button>
        </div>
        {available === true && <div className="text-green-600 text-sm mt-1">Available ✓</div>}
        {available === false && <div className="text-red-600 text-sm mt-1">Taken ✗ — try another</div>}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onPublish} disabled={disabled || available === false}>
          {loading ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
