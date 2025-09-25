import React from 'react'

const minimalPalettes = {
  'color-1': {
    primary: '#000000',
    secondary: '#666666',
    text1: '#000000',
    text2: '#666666',
    background: '#FFFFFF',
    cardBg: '#FFFFFF',
    buttonBg: '#000000',
    buttonText: '#FFFFFF',
    border: '#E5E5E5',
    accent: '#F5F5F5',
    overlay: 'rgba(0,0,0,0.03)',
  },
  'color-2': {
    primary: '#1A56DB',
    secondary: '#6B7280',
    text1: '#111827',
    text2: '#6B7280',
    background: '#F9FAFB',
    cardBg: '#FFFFFF',
    buttonBg: '#1A56DB',
    buttonText: '#FFFFFF',
    border: '#E5E7EB',
    accent: '#F3F4F6',
    overlay: 'rgba(0,0,0,0.03)',
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

export default function Minimalism({ paletteKey = 'color-1', data = {} }) {
  const t = minimalPalettes[paletteKey] ?? minimalPalettes['color-1']
  
  // Font: Helvetica Neue
  const fontStyle = {
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
  }

  // Extract data with safe fallbacks
  const creator = safeGet(data, 'creator', {})
  const courses = safeGet(data, 'courses', [])
  const highlights = safeGet(data, 'highlights', [])
  const links = safeGet(data, 'links', [])
  const stats = safeGet(data, 'stats', {})

  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0)
  const bannerUrl = safeGet(creator, 'banner_url')

  return (
    <div className="min-h-screen" style={{ 
      background: t.background, 
      color: t.text1,
      ...fontStyle 
    }}>
      {/* Minimal Header */}
      <header className="border-b" style={{ borderColor: t.border }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-light" style={{ color: t.primary }}>
              {safeGet(creator, 'full_name', 'Professor')}
            </div>
            <nav className="flex gap-8">
              <a href="#courses" className="text-sm hover:underline" style={{ color: t.text2 }}>
                Courses {courses.length > 0 && `(${courses.length})`}
              </a>
              <a href="#about" className="text-sm hover:underline" style={{ color: t.text2 }}>About</a>
              <a href="#contact" className="text-sm hover:underline" style={{ color: t.text2 }}>Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Banner */}
      <section className="relative">
        {bannerUrl && (
          <div className="w-full h-80 md:h-96">
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
        )}
        
        <div className={`max-w-4xl mx-auto px-6 py-16 ${bannerUrl ? 'text-center -mt-20 relative z-10' : 'py-20'}`}>
          {/* Profile Image */}
          <div className={`mb-8 ${bannerUrl ? 'inline-block bg-white p-2 rounded-full shadow-lg' : ''}`}>
            <img
              src={safeGet(creator, 'profile_image_url', 'https://placehold.co/120x120')}
              alt={safeGet(creator, 'full_name', 'Professor')}
              className="w-24 h-24 rounded-full object-cover border"
              style={{ borderColor: t.border }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/120x120'
              }}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight" style={{ color: t.primary }}>
            {safeGet(creator, 'full_name', 'Professor Name')}
          </h1>
          
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: t.text2 }}>
            {safeGet(creator, 'bio', 'Creating meaningful learning experiences through carefully designed courses.')}
          </p>

          {/* Minimal CTA */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-6 py-2 text-sm border font-medium transition-colors"
                    style={{ 
                      borderColor: t.primary, 
                      color: t.primary,
                      background: t.background 
                    }}>
              View Courses {courses.length > 0 && `(${courses.length})`}
            </button>
            <button className="px-6 py-2 text-sm font-medium transition-colors"
                    style={{ 
                      background: t.buttonBg, 
                      color: t.buttonText 
                    }}>
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(courses.length > 0 || totalStudents > 0) && (
        <section className="border-y" style={{ borderColor: t.border }}>
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-light mb-1" style={{ color: t.primary }}>
                  {courses.length}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: t.text2 }}>
                  Courses
                </div>
              </div>
              <div>
                <div className="text-2xl font-light mb-1" style={{ color: t.primary }}>
                  {totalStudents}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: t.text2 }}>
                  Students
                </div>
              </div>
              <div>
                <div className="text-2xl font-light mb-1" style={{ color: t.primary }}>
                  {stats.average_rating || '4.9'}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: t.text2 }}>
                  Rating
                </div>
              </div>
              <div>
                <div className="text-2xl font-light mb-1" style={{ color: t.primary }}>
                  100%
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: t.text2 }}>
                  Completion
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Courses Section */}
      <section id="courses" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-light mb-12 text-center" style={{ color: t.primary }}>
          {courses.length > 0 ? `Courses (${courses.length})` : 'Course Portfolio'}
        </h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="border-b pb-8" style={{ borderColor: t.border }}>
                <h3 className="text-xl font-normal mb-3" style={{ color: t.primary }}>
                  {course.title}
                </h3>
                
                <p className="mb-4 leading-relaxed" style={{ color: t.text2 }}>
                  {course.description}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: t.text2 }}>
                    {course.student_count} students • {course.professor_name}
                  </span>
                  <button className="underline hover:no-underline" style={{ color: t.primary }}>
                    Learn more
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 border-b" style={{ borderColor: t.border }}>
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-light mb-2" style={{ color: t.primary }}>Courses in Preparation</h3>
            <p style={{ color: t.text2 }}>New educational content is being developed.</p>
          </div>
        )}
      </section>

      {/* Additional Sections */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Highlights */}
          <div>
            <h3 className="text-lg font-normal mb-6" style={{ color: t.primary }}>Teaching Approach</h3>
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <div key={index}>
                  <h4 className="font-medium mb-1" style={{ color: t.primary }}>{highlight.title}</h4>
                  <p className="text-sm" style={{ color: t.text2 }}>{highlight.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-normal mb-6" style={{ color: t.primary }}>Resources</h3>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer"
                   className="block py-2 text-sm hover:underline" style={{ color: t.text2 }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner Showcase Section */}
      {bannerUrl && (
        <section className="border-t" style={{ borderColor: t.border }}>
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h3 className="text-lg font-normal mb-6 text-center" style={{ color: t.primary }}>
              Learning Environment
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={bannerUrl}
                alt="Learning Environment"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: t.text2 }}>
                  Dedicated to providing the best educational experience
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Minimal Footer */}
      <footer className="border-t text-center py-8" style={{ borderColor: t.border }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm" style={{ color: t.text2 }}>
            © {new Date().getFullYear()} {safeGet(creator, 'full_name', 'Professor')}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export { minimalPalettes as minimalisticPalettes }