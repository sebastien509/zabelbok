// src/components/ui/templates/Glassmorphism.jsx
import React from 'react'

const palettes = {
  'color-1': {
    primary: '#3498db',
    secondary: '#2ecc71',
    text1: '#333333',
    text2: '#555555',
    background: '#f4f4f4',
    cardBg: 'rgba(255,255,255,0.6)',
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
    cardBg: 'rgba(255,255,255,0.55)',
    buttonBg: '#c0392b',
    buttonText: '#ffffff',
    gradientFrom: 'rgba(231,76,60,0.95)',
    gradientTo: 'rgba(243,156,18,0.90)',
  },
}

export default function Glassmorphism({ paletteKey = 'color-1', data = {} }) {
  const t = palettes[paletteKey] ?? palettes['color-1']
  const {
    name = 'Your Name',
    headline = 'Glass look',
    bio = 'Short bio.',
    avatarUrl,
    bannerUrl,
    ctaUrl = '#',
    ctaText = 'Explore',
    links = [],
  } = data

  return (
    <div
      className="min-h-screen relative"
      style={{ background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`, color: t.text1 }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="backdrop-blur-xl rounded-3xl shadow-xl border p-6 md:p-8" style={{ background: t.cardBg, borderColor: '#fff6' }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={avatarUrl || 'https://placehold.co/128x128'}
              className="h-28 w-28 rounded-2xl object-cover ring-2 shadow"
              style={{ ringColor: t.primary }}
              alt="Avatar"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-semibold">{name}</h1>
              <p className="text-sm mt-1" style={{ color: t.text2 }}>{headline}</p>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 px-4 py-2 rounded-lg font-medium shadow"
                style={{ background: t.buttonBg, color: t.buttonText }}
              >
                {ctaText}
              </a>
            </div>
          </div>

          {bannerUrl ? (
            <img src={bannerUrl} className="mt-6 w-full h-60 object-cover rounded-2xl" alt="Banner" />
          ) : null}

          <div className="mt-6 rounded-2xl p-4 border backdrop-blur-md" style={{ background: t.cardBg, borderColor: '#fff5' }}>
            <h3 className="font-medium" style={{ color: t.primary }}>About</h3>
            <p className="text-sm mt-2" style={{ color: t.text2 }}>{bio}</p>
          </div>

          {!!links.length && (
            <div className="mt-4 rounded-2xl p-4 border backdrop-blur-md" style={{ background: t.cardBg, borderColor: '#fff5' }}>
              <h3 className="font-medium" style={{ color: t.primary }}>Links</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {links.slice(0, 6).map((l, i) => (
                  <li key={i}>
                    <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const glassPalettes = palettes
