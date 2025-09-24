// src/components2/onboarding/steps/TemplateStep.jsx
import { Button } from '@/components2/bento-UI/button'
import { TemplateRenderer } from '@/components2/pages/template/index.jsx'

const TEMPLATES = [
  { id: 'theme-1', name: 'Bento — Card Grid' },
  { id: 'theme-2', name: 'Minimalistic — Clean' },
  { id: 'theme-3', name: 'Glassmorphism — Frosted' },
]

const mockData = {
  name: 'Preview Name',
  headline: 'Creator & Educator',
  bio: 'This is a short example bio for the live preview.',
  links: [{ label: 'Website', url: '#' }, { label: 'YouTube', url: '#' }],
  highlights: [{ title: 'Course A', desc: 'Short desc' }, { title: 'Workshop B', desc: 'Short desc' }],
}

export default function TemplateStep({ template, onPick, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Choose a template</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={()=>onPick(t.id)}
            className={`rounded-lg border overflow-hidden text-left ${template===t.id?'border-[#EA7125]':'border-black/10'}`}
            title={t.name}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <div className="scale-[0.55] origin-top-left w-[180%] h-[180%] pointer-events-none">
                <TemplateRenderer template={t.id} paletteKey="color-1" data={mockData} />
              </div>
            </div>
            <div className="p-3 text-sm">{t.name}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}
