// src/components/ui/templates/Bento.jsx
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

export default function Bento({ paletteKey = 'color-1', data = {} }) {
  const t = palettes[paletteKey] ?? palettes['color-1']
  const {
    name = 'Your Name',
    headline = 'Creator & Educator',
    bio = 'Short bio goes here.',
    avatarUrl,
    bannerUrl,
    ctaUrl = '#',
    ctaText = 'View Portfolio',
    highlights = [],
    links = [],
  } = data

  return (
    <div className="min-h-screen" style={{ background: t.background, color: t.text1 }}>
      <section
        className="relative pt-16 pb-12"
        style={{ background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})` }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={avatarUrl || 'https://placehold.co/160x160'}
              alt="Avatar"
              className="h-40 w-40 rounded-2xl object-cover ring-4 ring-white/40 shadow-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{name}</h1>
              <p className="text-white/90 mt-2">{headline}</p>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 px-5 py-2 rounded-lg font-medium shadow"
                style={{ background: t.buttonBg, color: t.buttonText }}
              >
                {ctaText}
              </a>
            </div>
          </div>
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Banner"
              className="mt-8 w-full h-56 md:h-72 object-cover rounded-2xl shadow-lg"
            />
          ) : null}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 grid gap-4 md:grid-cols-3">
        <div className="col-span-2 rounded-2xl p-5 shadow border" style={{ background: t.cardBg, borderColor: '#0001' }}>
          <h2 className="text-xl font-semibold" style={{ color: t.primary }}>About</h2>
          <p className="mt-2 text-sm" style={{ color: t.text2 }}>{bio}</p>
        </div>

        <div className="rounded-2xl p-5 shadow border" style={{ background: t.cardBg, borderColor: '#0001' }}>
          <h3 className="font-semibold mb-3" style={{ color: t.primary }}>Links</h3>
          <ul className="space-y-2">
            {links.slice(0, 6).map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noreferrer" className="underline" style={{ color: t.buttonBg }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 rounded-2xl p-5 shadow border" style={{ background: t.cardBg, borderColor: '#0001' }}>
          <h3 className="font-semibold mb-3" style={{ color: t.primary }}>Highlights</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {highlights.slice(0, 6).map((h, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ borderColor: '#0002' }}>
                <div className="font-medium">{h.title}</div>
                <div className="text-sm" style={{ color: t.text2 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export const bentoPalettes = palettes
