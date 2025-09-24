// src/components/ui/templates/index.js
import Bento, { bentoPalettes } from './Bento'
import Minimalistic, { minimalisticPalettes } from './Minimalistic'
import Glassmorphism, { glassPalettes } from './Glassmorphism'

export const TEMPLATE_COMPONENTS = {
  'theme-1': Bento,          // keep mapping simple: theme-1/2/3
  'theme-2': Minimalistic,
  'theme-3': Glassmorphism,
}

export const TEMPLATE_PALETTES = {
  'theme-1': bentoPalettes,
  'theme-2': minimalisticPalettes,
  'theme-3': glassPalettes,
}

export function TemplateRenderer({ template = 'theme-1', paletteKey = 'color-1', data }) {
  const Cmp = TEMPLATE_COMPONENTS[template] || Bento
  return <Cmp paletteKey={paletteKey} data={data} />
}
