// src/components2/onboarding/steps/MediaStep.jsx
import { Input } from '@/components2/ui/input'
import { Button } from '@/components2/bento-UI/button'

export default function MediaStep({ value, onChange, loading, onBack, onNext }) {
  const set = (k, v) => onChange(d => ({ ...d, [k]: v }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Branding & media</h2>

      <div>
        <label className="block text-sm mb-1">Banner image</label>
        <Input type="file" accept="image/*" onChange={(e)=>set('banner_file', e.target.files?.[0] || null)} />
        {!!value.banner_url && (
          <img src={value.banner_url} alt="banner" className="mt-3 h-32 rounded object-cover" />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">CTA text</label>
          <Input value={value.ctaText} onChange={e=>set('ctaText', e.target.value)} placeholder="Explore" />
        </div>
        <div>
          <label className="block text-sm mb-1">CTA URL</label>
          <Input value={value.ctaUrl} onChange={e=>set('ctaUrl', e.target.value)} placeholder="https://…" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={loading}>{loading ? 'Saving…' : 'Continue'}</Button>
      </div>
    </div>
  )
}
