import { useState } from 'react';
import SEO from '@/components2/SEO';
import { Link } from 'react-router-dom';
import { Footer } from '../../LandingPage';
import FeaturedSection from './FeaturedSection';
import ArticleGrid from './ArticleGrid';


export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (

    <>
    <div className="min-h-screen bg-ivoryNeutral">
      <Navbar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex pt-16"> {/* Added pt-16 for navbar spacing */}
        {/* Fixed Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <main className="flex-1  transition-all duration-300 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
      {/* <Footer/> */}
      </>
  );
}
export function Navbar({ onMenuToggle, isSidebarOpen }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-8xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Centered Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}
            >
              <img
                src="https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-white_ndemtl.png"
                alt="E-stratèji"
                className="h-7 w-7 object-contain m-auto"
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">E-stratèji</span>
          </Link>
        </div>

        {/* Right Side Buttons - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            Subscribe
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            Latest Issue
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white transition-colors duration-200 ml-3"
        >
          {isSidebarOpen ? (
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`
         fixed overflow-hidden scrollable-false top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-30
      `}>
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Buttons - Only show on mobile */}
          <div className="lg:hidden p-6 border-b border-gray-200">
            <div className="flex flex-col gap-3">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors duration-200">
                Subscribe
              </button>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-lg text-center font-medium transition-colors duration-200">
                Latest Issue
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 p-6">
            {/* Bento Navigation Grid */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Magazine', path: '/magazine', color: 'bg-green-500' },
                  { name: 'Newsroom', path: '/news', color: 'bg-red-500' },
                  { name: 'Podcasts', path: '/podcasts', color: 'bg-orange-500' },
                  { name: 'Business', path: '/business', color: 'bg-amber-700' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`${item.color} text-white p-3 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105 hover:shadow-md`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Full width navigation items */}
              <div className="space-y-2">
                {[
                  { name: 'Technology', path: '/technology' },
                  { name: 'Sustainability', path: '/sustainability' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-xl text-gray-900 text-center font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest Cover Magazine */}
            <div className="mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Winter 2024</h3>
                  <p className="text-white/80 text-sm mb-4">Latest Edition</p>
                  <div className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">
                    AI Revolution
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-bold text-green-600">24</div>
                <div className="text-xs text-gray-600">Articles</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-bold text-red-600">12</div>
                <div className="text-xs text-gray-600">Podcasts</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-bold text-orange-600">8</div>
                <div className="text-xs text-gray-600">Videos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Enhanced Magazine Page with proper sidebar integration
export default function MagazinePage() {
  const mainStory = {
    id: 1,
    title: "Digital Education Revolution in the Caribbean",
    excerpt: "How online learning platforms are transforming education access across Caribbean islands, bridging geographical barriers and creating new opportunities for students.",
    image: "/images/caribbean-education.jpg",
    category: "Cover Story",
    date: "2024-01-15",
    author: "Dr. Simone Clarke",
    slug: "digital-education-caribbean",
    readTime: "8 min read",
    tags: ["Education", "Technology", "Caribbean", "Innovation"]
  };

  return (
    <Layout>
      <SEO
        title="E-stratèji Magazine - Caribbean Education & Culture"
        description="Discover stories, insights, and educational resources focused on Afro-Caribbean communities and digital learning transformation."
        canonical="/magazine"
      />
      
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 w-full py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Main Story Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{mainStory.category}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {mainStory.title}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {mainStory.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                <span className="font-medium">{mainStory.author}</span>
                <span>{mainStory.date}</span>
                <span>{mainStory.readTime}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {mainStory.tags.map(tag => (
                  <span key={tag} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                  Read Full Story
                </button>
               
              </div>
            </div>

            {/* Main Story Visual */}
            <div className="relative">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-400 to-red-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Featured Insight</h3>
                    <p className="text-white/80">AI adoption expected to grow 240% by 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto py-12">
        <div className="space-y-12">
          {/* Featured Section */}
          <section>
          
            <FeaturedSection articles={featuredArticles} />
          </section>

          {/* Latest Articles */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Updated daily</span>
                <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  Filter
                </button>
              </div>
            </div>
            <ArticleGrid articles={latestArticles} />
          </section>
        </div>
      </div>
    </Layout>
  );
}


// Mock data
const featuredArticles = [
  {
    id: 1,
    title: "Preserving Caribbean History Through Digital Archives",
    excerpt: "How local historians are using technology to document and share the rich cultural heritage of Caribbean nations for future generations.",
    image: "/images/caribbean-history.jpg",
    category: "History",
    date: "2024-01-14",
    author: "Dr. Marcus Johnson",
    slug: "preserving-caribbean-history",
    readTime: "6 min read",
    tags: ["History", "Culture", "Digital Preservation"]
  },
  {
    id: 2,
    title: "The Rise of Caribbean EdTech Startups",
    excerpt: "Meet the innovators creating educational technology solutions tailored specifically for Caribbean learning environments and challenges.",
    image: "/images/edtech-caribbean.jpg",
    category: "Technology",
    date: "2024-01-13",
    author: "Sarah Thompson",
    slug: "rise-caribbean-edtech",
    readTime: "5 min read",
    tags: ["EdTech", "Startups", "Innovation"]
  }
];

const latestArticles = [
  {
    id: 3,
    title: "Digital Literacy Programs Transforming Rural Communities",
    excerpt: "Community-led initiatives bringing digital skills to remote Caribbean villages, empowering residents with new economic opportunities.",
    image: "/images/digital-literacy.jpg",
    category: "Education",
    date: "2024-01-12",
    author: "Maria Rodriguez",
    slug: "digital-literacy-programs",
    readTime: "7 min read",
    tags: ["Digital Literacy", "Community", "Empowerment"]
  },
  {
    id: 4,
    title: "Caribbean Languages in the Digital Age",
    excerpt: "Preserving and promoting Creole, Patois, and indigenous languages through online platforms and educational technology.",
    image: "/images/caribbean-languages.jpg",
    category: "Culture",
    date: "2024-01-11",
    author: "David Clarke",
    slug: "caribbean-languages-digital",
    readTime: "8 min read",
    tags: ["Languages", "Culture", "Preservation"]
  },
  {
    id: 5,
    title: "Sustainable Agriculture Education for Youth",
    excerpt: "How schools across the Caribbean are integrating sustainable farming practices into their curriculum to build food security.",
    image: "/images/sustainable-agriculture.jpg",
    category: "Sustainability",
    date: "2024-01-10",
    author: "Lisa Williams",
    slug: "sustainable-agriculture-education",
    readTime: "6 min read",
    tags: ["Agriculture", "Sustainability", "Youth"]
  },
  {
    id: 6,
    title: "Virtual Exchange Programs Connecting Caribbean Students",
    excerpt: "Digital platforms enabling Caribbean students to collaborate with peers across the diaspora and around the world.",
    image: "/images/virtual-exchange.jpg",
    category: "Education",
    date: "2024-01-09",
    author: "James Wilson",
    slug: "virtual-exchange-programs",
    readTime: "5 min read",
    tags: ["Global Learning", "Technology", "Community"]
  }
];