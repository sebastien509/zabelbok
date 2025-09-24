// src/components/ui/templates/Minimalistic.jsx
import React from 'react'

const palettes = {
  'color-1': {
    primary: '#3498db',
    secondary: '#2ecc71',
    text1: '#333333',
    text2: '#555555',
    background: '#f4f4f4',
    cardBg: '#ffffff',
    buttonBg: '#2980b9',
    buttonText: '#ffffff',
    gradientFrom: 'rgba(52,152,219,0.95)',
    gradientTo: 'rgba(46,204,113,0.90)',
  },
  'color-2': {
    primary: '#e74c3c',
    secondary: '#f39c12',
    text1: '#222222',
    text2: '#444444',
    background: '#ecf0f1',
    cardBg: '#ffffff',
    buttonBg: '#c0392b',
    buttonText: '#ffffff',
    gradientFrom: 'rgba(231,76,60,0.95)',
    gradientTo: 'rgba(243,156,18,0.90)',
  },
}

export default function Minimalistic({ paletteKey = 'color-1', data = {} }) {
  const t = palettes[paletteKey] ?? palettes['color-1']
  const {
    name = 'Your Name',
    headline = 'Minimal profile',
    bio = 'Short bio.',
    avatarUrl,
    bannerUrl,
    ctaUrl = '#',
    ctaText = 'Contact',
  } = data

  return (
    <div className="min-h-screen" style={{ background: t.background, color: t.text1 }}>
      <header className="max-w-4xl mx-auto px-4 py-10 flex items-center gap-5">
        <img
          src={avatarUrl || 'https://placehold.co/96x96'}
          alt="Avatar"
          className="h-20 w-20 rounded-full object-cover border"
          style={{ borderColor: t.primary }}
        />
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-sm" style={{ color: t.text2 }}>{headline}</p>
        </div>
        <div className="ml-auto">
          <a
            href={ctaUrl}
            className="px-4 py-2 rounded-lg text-sm font-medium shadow"
            style={{ background: t.buttonBg, color: t.buttonText }}
          >
            {ctaText}
          </a>
        </div>
      </header>

      {bannerUrl ? (
        <div className="max-w-4xl mx-auto px-4">
          <img src={bannerUrl} className="w-full h-56 object-cover rounded-xl border" style={{ borderColor: '#0002' }} />
        </div>
      ) : null}

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="prose max-w-none">
          <p style={{ color: t.text2 }}>{bio}</p>
        </article>
      </main>

      <footer className="max-w-3xl mx-auto px-4 pb-10 text-xs" style={{ color: t.text2 }}>
        © {new Date().getFullYear()} {name}
      </footer>
    </div>
  )
}

export const minimalisticPalettes = palettes
