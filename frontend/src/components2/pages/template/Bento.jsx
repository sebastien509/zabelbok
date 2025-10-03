import React from 'react'

const bentoPalettes = {
  'color-1': {
    primary: '#6366F1',
    secondary: '#10B981',
    accent: '#8B5CF6',
    text1: '#1F2937',
    text2: '#6B7280',
    background: '#F9FAFB',
    cardBg: '#000000',
    bgImage:"url",
    buttonBg: '#4F46E5',
    buttonText: '#FFFFFF',
    gradientFrom: 'rgba(99, 102, 241, 0.95)',
    gradientTo: 'rgba(16, 185, 129, 0.90)',
    bentoBg1: 'rgba(99, 102, 241, 0.1)',
    bentoBg2: 'rgba(16, 185, 129, 0.1)',
    bentoBg3: 'rgba(139, 92, 246, 0.1)',
  },
  'color-2': {
    primary: '#DC2626',
    secondary: '#EA580C',
    accent: '#DB2777',
    text1: '#1F2937',
    text2: '#6B7280',
    background: '#FEF2F2',
    cardBg: '#FFFFFF',
    bgImage:"url",
    buttonBg: '#B91C1C',
    buttonText: '#FFFFFF',
    gradientFrom: 'rgba(220, 38, 38, 0.95)',
    gradientTo: 'rgba(234, 88, 12, 0.90)',
    bentoBg1: 'rgba(220, 38, 38, 0.1)',
    bentoBg2: 'rgba(234, 88, 12, 0.1)',
    bentoBg3: 'rgba(219, 39, 119, 0.1)',
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

export default function Bento({ paletteKey = 'color-1', data = {} }) {
  const t = bentoPalettes[paletteKey] ?? bentoPalettes['color-1']
  
  // Font: Inter
  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }

  // Extract data with safe fallbacks
  const creator = safeGet(data, 'creator', {})
  const courses = safeGet(data, 'courses', [])
  const highlights = safeGet(data, 'highlights', [])
  const links = safeGet(data, 'links', [])
  const stats = safeGet(data, 'stats', {})

  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0)

  return (
    <div className="min-h-screen" style={{ 
      background: t.background, 
      color: t.text1,
      ...fontStyle 
    }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
                <img
                  src={safeGet(creator, 'profile_image_url', 'https://placehold.co/200x200')}
                  alt={safeGet(creator, 'full_name', 'Professor')}
                  className="w-32 h-32 rounded-2xl mx-auto object-cover border-4 border-white/40 shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/200x200'
                  }}
                />
                <div className="text-center mt-6">
                  <h1 className="text-2xl font-bold text-white" style={fontStyle}>
                    {safeGet(creator, 'full_name', 'Professor Name')}
                  </h1>
                  <p className="text-white/90 mt-2 text-sm">
                    {safeGet(creator, 'bio', 'Educator & Course Creator').split('.')[0]}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h2 className="text-4xl font-bold text-white mb-4" style={fontStyle}>
                  Welcome to My Courses
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  {safeGet(creator, 'bio', 'Discover comprehensive learning experiences designed to help you succeed.')}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button className="px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105"
                    style={{ background: t.buttonBg, color: t.buttonText }}>
                    Explore Courses ({courses.length})
                  </button>
                  <button className="px-6 py-3 rounded-xl font-semibold border-2 border-white/30 text-white backdrop-blur-lg transition-all hover:bg-white/10">
                    Contact Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          {safeGet(creator, 'banner_url') && (
            <div className="mt-8 rounded-2xl overflow-hidden">
              <img
                src={safeGet(creator, 'banner_url')}
                alt="Banner"
                className="w-full h-48 md:h-64 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 -mt-10 relative z-10">
        {/* Courses Section */}
        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div key={course.id} className={`rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  index % 3 === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`} style={{
                  background: index % 3 === 0 ? t.bentoBg1 : 
                            index % 3 === 1 ? t.bentoBg2 : t.bentoBg3,
                  borderColor: 'rgba(0,0,0,0.1)'
                }}>
                  <h3 className="font-bold text-lg mb-2" style={{ color: t.primary }}>
                    {course.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: t.text2 }}>
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: t.text2 }}>👥 {course.student_count} students</span>
                    <span style={{ color: t.primary }}>Enroll Now →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="rounded-2xl p-6 text-center" style={{ background: t.bentoBg1 }}>
                <div className="text-2xl font-bold" style={{ color: t.primary }}>{courses.length}</div>
                <div className="text-sm" style={{ color: t.text2 }}>Total Courses</div>
              </div>
              <div className="rounded-2xl p-6 text-center" style={{ background: t.bentoBg2 }}>
                <div className="text-2xl font-bold" style={{ color: t.secondary }}>{totalStudents}</div>
                <div className="text-sm" style={{ color: t.text2 }}>Total Students</div>
              </div>
              <div className="rounded-2xl p-6 text-center" style={{ background: t.bentoBg3 }}>
                <div className="text-2xl font-bold" style={{ color: t.accent }}>{stats.average_rating || '4.9'}/5</div>
                <div className="text-sm" style={{ color: t.text2 }}>Average Rating</div>
              </div>
              <div className="rounded-2xl p-6 text-center" style={{ background: t.bentoBg1 }}>
                <div className="text-2xl font-bold" style={{ color: t.primary }}>100%</div>
                <div className="text-sm" style={{ color: t.text2 }}>Satisfaction</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="rounded-2xl p-8 max-w-md mx-auto" style={{ background: t.cardBg }}>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: t.primary }}>No Courses Available Yet</h3>
              <p style={{ color: t.text2 }}>Check back soon for new course offerings.</p>
            </div>
          </div>
        )}

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Highlights Section */}
          <div className="rounded-2xl p-6" style={{ background: t.cardBg }}>
            <h3 className="font-semibold mb-4" style={{ color: t.primary }}>Highlights</h3>
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ background: t.primary }}></div>
                  <div>
                    <div className="font-medium">{highlight.title}</div>
                    <div className="text-sm" style={{ color: t.text2 }}>{highlight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="rounded-2xl p-6" style={{ background: t.cardBg }}>
            <h3 className="font-semibold mb-4" style={{ color: t.primary }}>Links</h3>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" 
                   className="block py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                   style={{ color: t.buttonBg }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export { bentoPalettes }