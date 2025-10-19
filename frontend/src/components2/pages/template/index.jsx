// src/components/ui/templates/index.js
import Bento, { bentoPalettes } from './Bento'
import MinimalisticTemplate, { minimalPalettes } from './Minimalistic'
import Glassmorphism, { glassPalettes } from './Glassmorphism'

// Placeholder data as fallback
export const placeholderCreatorData = {
  creator: {
    id: 1,
    full_name: "Dr. Sarah Chen",
    email: "sarah.chen@university.edu",
    role: "professor",
    school_id: 1,
    bio: "Award-winning Computer Science professor with 10+ years of experience in AI and Machine Learning. Passionate about making complex concepts accessible to students of all levels.",
    profile_image_url: "https://www.headshotphoto.io/_vercel/image?url=%2Fimages%2Fblogs%2Fearth-tones.webp&w=1536&q=100",
    banner_url: "https://res.cloudinary.com/dyeomcmin/image/upload/v1740688150/bgs_w6ilsk.png",
    theme: "theme-1",
    color: false,
    slug: "sarah-chen",
    language: "en"
  },
  courses: [
    {
      id: 1,
      title: "Introduction to Artificial Intelligence",
      description: "Learn the fundamentals of AI, including machine learning, neural networks, and natural language processing.",
      professor_id: 1,
      school_id: 1,
      student_count: 245,
      module_count: 8,
      duration: "12 weeks",
      level: "Beginner",
      rating: 4.8,
      price: 89.99,
      image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      title: "Advanced Machine Learning",
      description: "Deep dive into advanced ML techniques including deep learning, reinforcement learning, and computer vision.",
      professor_id: 1,
      school_id: 1,
      student_count: 156,
      module_count: 10,
      duration: "16 weeks",
      level: "Advanced",
      rating: 4.9,
      price: 129.99,
      image_url: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ],
  highlights: [
    {
      title: "Industry Expert",
      desc: "10+ years experience in AI research and development"
    },
    {
      title: "Student Success",
      desc: "Over 800 students taught with 95% satisfaction rate"
    }
  ],
  links: [
    {
      label: "Personal Website",
      url: "https://sarahchen-ai.com"
    },
    {
      label: "LinkedIn Profile",
      url: "https://linkedin.com/in/sarahchen"
    }
  ],
  stats: {
    total_courses: 4,
    total_students: 802,
    average_rating: 4.8,
    completion_rate: 87
  }
}

// Minimal fallback data for empty states
export const minimalCreatorData = {
  creator: {
    id: 0,
    full_name: "Creator Name",
    bio: "Educator and course creator",
    profile_image_url: "https://via.placeholder.com/150",
    banner_url: null,
    theme: "theme-1",
    color: false,
    slug: "creator"
  },
  courses: [],
  highlights: [],
  links: [],
  stats: {
    total_courses: 0,
    total_students: 0,
    average_rating: 0,
    completion_rate: 0
  }
}

// Data validation and normalization utility
export const normalizeTemplateData = (data) => {
  if (!data) return placeholderCreatorData
  
  // Ensure required structure exists
  const normalized = {
    creator: {
      id: data.creator?.id || placeholderCreatorData.creator.id,
      full_name: data.creator?.full_name || placeholderCreatorData.creator.full_name,
      bio: data.creator?.bio || placeholderCreatorData.creator.bio,
      profile_image_url: data.creator?.profile_image_url || placeholderCreatorData.creator.profile_image_url,
      banner_url: data.creator?.banner_url || placeholderCreatorData.creator.banner_url,
      theme: data.creator?.theme || placeholderCreatorData.creator.theme,
      color: data.creator?.color || placeholderCreatorData.creator.color,
      slug: data.creator?.slug || placeholderCreatorData.creator.slug,
      language: data.creator?.language || placeholderCreatorData.creator.language,
      // Include any additional fields that might be present
      ...data.creator
    },
    courses: Array.isArray(data.courses) ? data.courses : placeholderCreatorData.courses,
    highlights: Array.isArray(data.highlights) ? data.highlights : placeholderCreatorData.highlights,
    links: Array.isArray(data.links) ? data.links : placeholderCreatorData.links,
    stats: {
      ...placeholderCreatorData.stats,
      ...(data.stats || {})
    }
  }

  // If courses array is empty but we have individual course data, try to extract it
  if (normalized.courses.length === 0 && data.courses) {
    if (Array.isArray(data.courses)) {
      normalized.courses = data.courses
    } else if (typeof data.courses === 'object') {
      normalized.courses = [data.courses]
    }
  }

  return normalized
}

// Template components mapping
export const TEMPLATE_COMPONENTS = {
  'theme-1': Bento,
  'theme-2': MinimalisticTemplate,
  'theme-3': Glassmorphism,
}

// Template palettes mapping
export const TEMPLATE_PALETTES = {
  'theme-1': bentoPalettes,
  'theme-2': minimalPalettes,
  'theme-3': glassPalettes,
}

// Get default palette key for a template
export const getDefaultPaletteKey = (template) => {
  const palettes = TEMPLATE_PALETTES[template]
  return palettes ? Object.keys(palettes)[0] : 'color-1'
}

// Main Template Renderer Component
export function TemplateRenderer({ 
  template = 'theme-1', 
  paletteKey = null, 
  data = null,
  ...props 
}) {
  // Validate template
  const validTemplate = TEMPLATE_COMPONENTS[template] ? template : 'theme-1'
  const Cmp = TEMPLATE_COMPONENTS[validTemplate]
  
  // Get appropriate palette key
  const templatePalettes = TEMPLATE_PALETTES[validTemplate]
  const defaultPaletteKey = getDefaultPaletteKey(validTemplate)
  const validPaletteKey = templatePalettes?.[paletteKey] ? paletteKey : defaultPaletteKey
  
  // Normalize data with fallback
  const normalizedData = normalizeTemplateData(data)
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('TemplateRenderer:', {
      template: validTemplate,
      paletteKey: validPaletteKey,
      data: normalizedData,
      availablePalettes: Object.keys(templatePalettes || {})
    })
  }

  return (
    <Cmp 
      paletteKey={validPaletteKey}
      data={normalizedData}
      {...props}
    />
  )
}

// Additional utility exports
export {
  bentoPalettes,
  minimalPalettes, 
  glassPalettes
}

export default TemplateRenderer