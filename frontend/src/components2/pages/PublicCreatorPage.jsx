// src/components2/pages/PublicCreatorPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { api } from '@/services/api'
import { TemplateRenderer } from '@/components2/pages/template/index.jsx'

/**
 * Attempts to fetch by slug first (if present), then falls back to ID.
 * Backend routes expected:
 *  - GET /auth/public/<int:user_id>            (already in your code)
 *  - optional: GET /auth/public/slug/<slug>    (add later if desired)
 */
async function fetchPublicCreator({ slug, id }) {
  // Try slug endpoint if slug exists and is not just a number
  if (slug && isNaN(Number(slug))) {
    try {
      const { data } = await api.get(`/auth/public/slug/${encodeURIComponent(slug)}`)
      return data
    } catch (err) {
      // swallow and try ID next
      // console.warn('Slug lookup failed, trying ID...', err)
    }
  }

  // If ID param exists (or slug is numeric), use /auth/public/:id
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

    // Backend returns public fields (see public_creator_dict):
    // id, full_name, bio, profile_image_url, banner_url, theme, role
    const {
      id: userId,
      full_name,
      bio,
      profile_image_url,
      banner_url,
      theme = 'theme-1',
      // if you add color (boolean) to the public payload, we’ll use it:
      color = false,
      // optionally attach courses later
      courses = [],
    } = creator

    return {
      userId,
      name: full_name,
      bio: bio || 'No bio yet.',
      avatarUrl: profile_image_url || '',
      bannerUrl: banner_url || '',
      // The template key is your theme (theme-1/2/3)
      template: theme,
      // Palette derived from boolean `color` (false → color-1, true → color-2)
      paletteKey: color ? 'color-2' : 'color-1',
      // Optional portfolio-ish fields your templates can use
      stats: {
        courses: Array.isArray(courses) ? courses.length : 0,
      },
      links: {
        // add safe public links if you have them
      },
      featured: {
        // add featured courses/modules if you expose them publicly
      },
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

  const { name, bio, avatarUrl, bannerUrl, template, paletteKey } = viewData

  return (
    <>
      <Helmet>
        <title>{name} — Creator</title>
        <meta name="description" content={bio?.slice(0, 150) || `${name} on E-strateji`} />
        {avatarUrl && <link rel="preload" as="image" href={avatarUrl} />}
        {bannerUrl && <link rel="preload" as="image" href={bannerUrl} />}
        {/* Basic OpenGraph */}
        <meta property="og:title" content={`${name} — Creator`} />
        <meta property="og:description" content={bio?.slice(0, 180) || ''} />
        {bannerUrl && <meta property="og:image" content={bannerUrl} />}
      </Helmet>

      {/* Let the chosen template do the heavy lifting */}
      <TemplateRenderer
        template={template}
        paletteKey={paletteKey}
        data={viewData}
      />
    </>
  )
}
