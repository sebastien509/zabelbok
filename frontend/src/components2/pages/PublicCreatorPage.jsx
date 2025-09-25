// src/components2/pages/PublicCreatorPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { api } from '@/services/api'
import { TemplateRenderer } from '@/components2/pages/template/index.jsx'

async function fetchPublicCreator({ slug, id }) {
  if (slug && isNaN(Number(slug))) {
    try {
      const { data } = await api.get(`/auth/public/slug/${encodeURIComponent(slug)}`)
      return data
    } catch (err) {
      // swallow and try ID next
    }
  }

  const numericId = id ?? (slug && /^\d+$/.test(slug) ? slug : null)
  if (!numericId) {
    const e = new Error('No valid slug or id provided')
    e.status = 400
    throw e
  }

  const { data } = await api.get(`/auth/public/${numericId}`)
  return data
}

export default function PublicCreatorPage() {
  const { slug, id } = useParams()
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetchPublicCreator({ slug, id })
      .then((data) => {
        if (!alive) return
        setCreator(data)
      })
      .catch((err) => {
        if (!alive) return
        setError(err?.response?.data?.error || err.message || 'Failed to load creator')
      })
      .finally(() => alive && setLoading(false))

    return () => { alive = false }
  }, [slug, id])

  // Map API → template data shape
  const viewData = useMemo(() => {
    if (!creator) return null

    const {
      id: userId,
      full_name,
      bio,
      profile_image_url,
      banner_url,
      theme = 'theme-1',
      color = false,
      courses = [],
      // Include other fields that might be useful
      language,
      created_at,
    } = creator

    // Transform courses data to match template expectations
    const normalizedCourses = Array.isArray(courses) ? courses.map(course => ({
      id: course?.id || `course-${Math.random()}`,
      title: course?.title || 'Untitled Course',
      description: course?.description || 'Comprehensive course designed for optimal learning.',
      student_count: parseInt(course?.student_count) || 0,
      professor_name: course?.professor_name || full_name,
      // Include nested data if available
      lectures: course?.lectures || [],
      books: course?.books || [],
      quizzes: course?.quizzes || [],
      exercises: course?.exercises || [],
      modules: course?.modules || [],
    })) : []

    return {
      // Creator info (matches template expectations)
      creator: {
        id: userId,
        full_name: full_name || 'Professor',
        bio: bio || 'Creating meaningful learning experiences.',
        profile_image_url: profile_image_url || '',
        banner_url: banner_url || '',
        language: language || 'en',
        created_at: created_at,
        theme: theme,
        color: color,
      },
      
      // Courses data (array of courses)
      courses: normalizedCourses,
      
      // Template configuration
      template: theme,
      paletteKey: color ? 'color-2' : 'color-1',
      
      // Stats for display
      stats: {
        total_courses: normalizedCourses.length,
        total_students: normalizedCourses.reduce((sum, course) => sum + (course.student_count || 0), 0),
        average_rating: 4.9, // You can calculate this from real data if available
      },
      
      // Additional template data
      highlights: [
        { title: 'Expert Educator', desc: 'Years of teaching experience' },
        { title: 'Student Focused', desc: 'Proven track record of student success' },
        { title: 'Innovative Methods', desc: 'Cutting-edge teaching approaches' },
      ],
      
      links: [
        { label: 'Professional Website', url: '#' },
        { label: 'LinkedIn Profile', url: '#' },
        { label: 'Academic Publications', url: '#' },
      ]
    }
  }, [creator])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading creator…
        </div>
      </div>
    )
  }

  if (error || !viewData) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full bg-white shadow-sm rounded-xl p-6 border">
          <h1 className="text-xl font-semibold mb-2">Creator not found</h1>
          <p className="text-gray-600 mb-4">{error || 'We could not load this creator page.'}</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { creator: creatorData, template, paletteKey } = viewData

  return (
    <>
      <Helmet>
        <title>{creatorData.full_name} — Creator</title>
        <meta name="description" content={creatorData.bio?.slice(0, 150) || `${creatorData.full_name} on E-strateji`} />
        {creatorData.profile_image_url && <link rel="preload" as="image" href={creatorData.profile_image_url} />}
        {creatorData.banner_url && <link rel="preload" as="image" href={creatorData.banner_url} />}
        <meta property="og:title" content={`${creatorData.full_name} — Creator`} />
        <meta property="og:description" content={creatorData.bio?.slice(0, 180) || ''} />
        {creatorData.banner_url && <meta property="og:image" content={creatorData.banner_url} />}
      </Helmet>

      <TemplateRenderer
        template={template}
        paletteKey={paletteKey}
        data={viewData} // Pass the complete viewData object
      />
    </>
  )
}