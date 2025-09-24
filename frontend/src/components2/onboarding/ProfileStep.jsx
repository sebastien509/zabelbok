// src/components2/onboarding/steps/ProfileStep.jsx
import { Input } from '@/components2/ui/input'
import { Button } from '@/components2/bento-UI/button'

export default function ProfileStep({ value, onChange, loading, onBack, onNext }) {
  const set = (k, v) => onChange(d => ({ ...d, [k]: v }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile details</h2>

      <div>
        <label className="block text-sm mb-1">Short bio</label>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          value={value.bio}
          onChange={e=>set('bio', e.target.value)}
          placeholder="Tell us about your work…"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Preferred language</label>
        <select
          className="w-full border rounded p-2"
          value={value.language}
          onChange={e=>set('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="ht">Kreyòl</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Profile image</label>
        <Input type="file" accept="image/*" onChange={(e)=>set('profile_image_file', e.target.files?.[0] || null)} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={loading}>{loading ? 'Saving…' : 'Continue'}</Button>
      </div>
    </div>
  )
}
