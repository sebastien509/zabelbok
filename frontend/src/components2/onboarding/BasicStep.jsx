// src/components2/onboarding/steps/BasicStep.jsx
import { Input } from '@/components2/ui/input'
import { Button } from '@/components2/bento-UI/button'

export default function BasicStep({ value, onChange, loading, onNext }) {
  const set = (k, v) => onChange(d => ({ ...d, [k]: v }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create your account</h2>

      <div>
        <label className="block text-sm mb-1">Full name</label>
        <Input value={value.full_name} onChange={e=>set('full_name', e.target.value)} placeholder="Jane Doe" />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <Input type="email" value={value.email} onChange={e=>set('email', e.target.value)} placeholder="jane@email.com" />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <Input type="password" value={value.password} onChange={e=>set('password', e.target.value)} placeholder="••••••••" />
      </div>

      <div className="pt-2">
        <Button className="w-full" onClick={onNext} disabled={loading}>
          {loading ? 'Creating…' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
