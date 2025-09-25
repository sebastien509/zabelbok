import React from 'react'

const glassPalettes = {
  'color-1': {
    primary: '#3B82F6',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    text1: '#FFFFFF',
    text2: 'rgba(255,255,255,0.8)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    buttonBg: 'rgba(59, 130, 246, 0.8)',
    buttonText: '#FFFFFF',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  'color-2': {
    primary: '#EF4444',
    secondary: '#F59E0B',
    accent: '#DB2777',
    text1: '#FFFFFF',
    text2: 'rgba(255,255,255,0.8)',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    buttonBg: 'rgba(239, 68, 68, 0.8)',
    buttonText: '#FFFFFF',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
}

// Safe data access utility
const safeGet = (obj, path, defaultValue = '') => {
  if (!obj) return defaultValue
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    result = result?.[key]
    if (result === null || result === undefined) return defaultValue
  }
  return result
}

export default function Glassmorphism({ paletteKey = 'color-1', data = {} }) {
  const t = glassPalettes[paletteKey] ?? glassPalettes['color-1']
  
  // Font: Poppins
  const fontStyle = {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif"
  }

  // Extract data with safe fallbacks
  const creator = safeGet(data, 'creator', {})
  const courses = safeGet(data, 'courses', [])
  const highlights = safeGet(data, 'highlights', [])
  const links = safeGet(data, 'links', [])
  const stats = safeGet(data, 'stats', {})

  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0)
  const bannerUrl = safeGet(creator, 'banner_url')

  const glassStyle = {
    background: t.cardBg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${t.glassBorder}`,
    boxShadow: t.glassShadow,
  }

  return (
    <div className="min-h-screen" style={{ 
      background: t.background,
      ...fontStyle 
    }}>
      {/* Hero Section with Banner Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Banner Background */}
        {bannerUrl ? (
          <div className="absolute inset-0">
            <img
              src={bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0" style={{ background: t.overlay }}></div>
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: t.background }}></div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-xl"
               style={{ background: t.primary }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-xl"
               style={{ background: t.secondary }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10 px-6">
          {/* Profile Image with Glass Effect */}
          <div className="inline-block p-4 rounded-3xl mb-8" style={glassStyle}>
            <img
              src={safeGet(creator, 'profile_image_url', 'https://placehold.co/150x150')}
              alt={safeGet(creator, 'full_name', 'Professor')}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.src = 'https://placehold.co/150x150'
              }}
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={fontStyle}>
            {safeGet(creator, 'full_name', 'Professor Name')}
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: t.text2 }}>
            {safeGet(creator, 'bio', 'Transforming education through innovative course design')}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <button className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{ background: t.buttonBg, color: t.buttonText }}>
              Browse Courses {courses.length > 0 && `(${courses.length})`}
            </button>
            <button className="px-8 py-3 rounded-xl font-semibold border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/10">
              Learn More
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="rounded-2xl p-4" style={glassStyle}>
              <div className="text-2xl font-bold text-white">{courses.length}</div>
              <div style={{ color: t.text2 }}>Courses</div>
            </div>
            <div className="rounded-2xl p-4" style={glassStyle}>
              <div className="text-2xl font-bold text-white">{totalStudents}</div>
              <div style={{ color: t.text2 }}>Students</div>
            </div>
            <div className="rounded-2xl p-4" style={glassStyle}>
              <div className="text-2xl font-bold text-white">{stats.average_rating || '4.9'}</div>
              <div style={{ color: t.text2 }}>Rating</div>
            </div>
            <div className="rounded-2xl p-4" style={glassStyle}>
              <div className="text-2xl font-bold text-white">100%</div>
              <div style={{ color: t.text2 }}>Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            {courses.length > 0 ? 'Featured Courses' : 'Course Portfolio'}
          </h2>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="rounded-3xl p-6 transition-all duration-500 hover:scale-105"
                     style={glassStyle}>
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                         style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <span className="text-white font-bold">📚</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-sm" style={{ color: t.text2 }}>
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: t.text2 }}>
                      {course.student_count} students enrolled
                    </span>
                    <button className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-white/20"
                            style={{ color: t.text1 }}>
                      Enroll →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl p-12 text-center" style={glassStyle}>
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Courses Coming Soon</h3>
              <p style={{ color: t.text2 }}>New courses are currently in development. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* Additional Content Sections */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Highlights Section */}
          <div className="rounded-3xl p-8" style={glassStyle}>
            <h3 className="text-2xl font-semibold text-white mb-6">Highlights</h3>
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                       style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-white text-sm">⭐</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{highlight.title}</h4>
                    <p style={{ color: t.text2 }}>{highlight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="rounded-3xl p-8" style={glassStyle}>
            <h3 className="text-2xl font-semibold text-white mb-6">Connect</h3>
            <div className="space-y-3">
              {links.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-white text-sm">🔗</span>
                  </div>
                  <span className="text-white">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner Usage Showcase */}
      {bannerUrl && (
        <section className="relative py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-white mb-6">Teaching Environment</h3>
            <div className="rounded-3xl overflow-hidden" style={glassStyle}>
              <img
                src={bannerUrl}
                alt="Teaching Environment"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <p style={{ color: t.text2 }}>State-of-the-art learning facilities and resources</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export { glassPalettes }