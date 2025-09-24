// src/components2/onboarding/steps/PaletteStep.jsx
import { Button } from '@/components2/bento-UI/button'
import { TEMPLATE_PALETTES, TemplateRenderer } from '@/components2/pages/template/index.jsx'

const OPTION_IDS = ['color-1','color-2']

export default function PaletteStep({ template, paletteKey, onPick, onBack, onNext }) {
  const palettes = TEMPLATE_PALETTES[template]
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pick a color palette</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {OPTION_IDS.map(id => {
          const p = palettes[id]
          return (
            <button
              key={id}
              onClick={()=>onPick(id)}
              className={`rounded-lg border overflow-hidden text-left ${paletteKey===id?'border-[#EA7125]':'border-black/10'}`}
              title={id}
            >
              <div className="h-12 flex">
                <div className="flex-1" style={{ background: p.primary }} />
                <div className="flex-1" style={{ background: p.secondary }} />
                <div className="flex-1" style={{ background: p.background }} />
              </div>
              <div className="p-3 text-sm capitalize">{id.replace('-', ' ')}</div>
            </button>
          )
        })}
      </div>

      <div className="rounded-lg border mt-4 overflow-hidden">
        <div className="p-3 text-sm bg-black/5">Live preview</div>
        <div className="scale-[0.6] origin-top-left w-[166%] h-[166%]">
          <TemplateRenderer template={template} paletteKey={paletteKey} data={{
            name: 'Preview Name',
            headline: 'Creator',
            bio: 'Palette preview for your page.',
          }} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}
