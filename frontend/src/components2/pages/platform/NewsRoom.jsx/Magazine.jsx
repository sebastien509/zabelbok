import { useState } from 'react';
import SEO from '@/components2/SEO';
import { Link } from 'react-router-dom';

export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivoryNeutral">
      <Navbar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 transition-all duration-300 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Navbar({ onMenuToggle, isSidebarOpen }) {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-brand-40 backdrop-blur-xl">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button and Logo */}
          <div className="flex items-center gap-4">
            {/* Menu Button */}
            <button
              onClick={onMenuToggle}
              className="text-blackOlive hover:text-brand p-2 transition-all duration-200 hover:bg-white/30 rounded-xl"
            >
              {isSidebarOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group/logo">
              <div
                className="relative h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-white/30 transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:ring-brand/40"
                style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}
              >
                <img
                  src="https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-white_ndemtl.png"
                  alt="E-stratèji Symbol"
                  className="absolute inset-0 m-auto h-8 w-8 object-contain"
                  draggable="false"
                />
              </div>
              <img
                src="https://res.cloudinary.com/dyeomcmin/image/upload/v1759381743/Estrateji_symbol_Text_Black_ycv3mv.png"
                alt="E-stratèji"
                className="h-8 w-auto object-contain transition-transform group-hover/logo:translate-x-1"
                draggable="false"
              />
            </Link>
          </div>

          {/* Desktop Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="bg-brand-40 hover:bg-brand-60 text-blackOlive px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
              Subscribe
            </button>
            <button className="bg-blackOlive hover:bg-blackOlive/80 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
              Latest Issue
            </button>
          </div>
        </div>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-80 transform transition-all duration-500 ease-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:shadow-none lg:z-30
      `}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="brand-tint-overlay h-full p-6 border-r border-brand-20 backdrop-blur-2xl">
            
            {/* Close button for mobile */}
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h2 className="text-xl font-bold text-blackOlive bg-orange-400/30 px-4 py-2 rounded-2xl">Navigation</h2>
              <button 
                onClick={onClose} 
                className="text-blackOlive hover:text-brand p-2 bg-orange-400/30 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Bento Navigation Grid */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Magazine', path: '/magazine', color: 'from-appleGreen to-appleGreen/80' },
                  { name: 'Newsroom', path: '/news', color: 'from-heritageRed to-heritageRed/80' },
                  { name: 'Podcasts', path: '/podcasts', color: 'from-burntOrange to-burntOrange/80' },
                  { name: 'Business', path: '/business', color: 'from-warmRootBrown to-warmRootBrown/80' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`bg-gradient-to-br ${item.color} text-black bg-orange-400/40 p-4 rounded-2xl text-center font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:translate-y-1`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Full width bento items */}
              {[
                { name: 'Technology', path: '/technology' },
                { name: 'Sustainability', path: '/sustainability' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className="block glass border border-orange-bg-orange-400/30 p-4 rounded-2xl text-blackOlive text-center font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-brand/30"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Latest Cover Magazine - Bento Style */}
            <div className="mb-6">
              <div className="glass border border-orange-bg-orange-400/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="aspect-[3/4] bg-gradient-to-br from-blackOlive to-blackOlive/80 flex flex-col items-center justify-center p-6 text-center relative">
                  {/* Magazine Corner Accent */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-brand rounded-full"></div>
                  
                  <div className="w-16 h-16 bg-orange-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-orange-bg-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-orange-bg-orange-400 text-xl mb-2">Winter 2024</h3>
                  <p className="text-orange-bg-orange-400/80 text-sm mb-4">Latest Edition</p>
                  <div className="text-xs text-orange-bg-orange-400/60 bg-orange-400/10 px-3 py-1 rounded-full">
                    AI Revolution & Sustainable Future
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="glass rounded-xl p-2 border border-white/20">
                <div className="text-lg font-bold text-brand">24</div>
                <div className="text-xs text-gray-600">Articles</div>
              </div>
              <div className="glass rounded-xl p-2 border border-white/20">
                <div className="text-lg font-bold text-heritageRed">12</div>
                <div className="text-xs text-gray-600">Podcasts</div>
              </div>
              <div className="glass rounded-xl p-2 border border-white/20">
                <div className="text-lg font-bold text-burntOrange">8</div>
                <div className="text-xs text-gray-600">Videos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import FeaturedSection from './FeaturedSection';
import ArticleGrid from './ArticleGrid';

// Enhanced Magazine Page with Bento Styling
export default function MagazinePage() {
  return (
    <Layout>
      <SEO
        title="Insights & Innovation"
        description="Discover the latest trends, stories, and insights shaping our world today."
        canonical="/magazine"
      />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blackOlive via-blackOlive/90 to-blackOlive/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl mb-8 border border-white/20">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Latest Edition Available</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
              Insights & Innovation
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover cutting-edge trends, transformative stories, and visionary insights 
              shaping our world today and tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Bento Grid */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
          {/* Main Content - 3/4 width */}
          <div className="xl:w-3/4 space-y-12 lg:space-y-16">
            {/* Featured Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-blackOlive">Featured Stories</h2>
                <div className="flex gap-2">
                  <button className="glass border border-brand-40 px-4 py-2 rounded-xl text-sm font-medium text-blackOlive hover:bg-brand-40 transition-all duration-200">
                    View All
                  </button>
                </div>
              </div>
              <FeaturedSection articles={featuredArticles} />
            </section>

            {/* Latest Articles */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-blackOlive">Latest Articles</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Updated daily</span>
                  <button className="glass border border-brand-40 px-4 py-2 rounded-xl text-sm font-medium text-blackOlive hover:bg-brand-40 transition-all duration-200">
                    Filter
                  </button>
                </div>
              </div>
              <ArticleGrid articles={latestArticles} />
            </section>
          </div>

          {/* Sidebar Content - 1/4 width */}
          <div className="xl:w-1/4 space-y-6 lg:space-y-8">
            {/* Newsletter Bento */}
            <div className="glass border border-brand-40 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-brand-40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blackOlive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blackOlive mb-2">Stay Updated</h3>
                <p className="text-gray-600 text-sm">Get curated insights delivered weekly</p>
              </div>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-60 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-80 to-brand-60 hover:from-brand-60 hover:to-brand-80 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  Subscribe Now
                </button>
              </form>
            </div>

            {/* Popular Tags Bento */}
            <div className="glass border border-brand-40 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-blackOlive mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {['AI Innovation', 'Green Tech', 'Web3', 'Biotech', 'Space', 'Fintech', 'Climate', 'VR/AR'].map(tag => (
                  <Link
                    key={tag}
                    to={`/tag/${tag.toLowerCase().replace(' ', '-')}`}
                    className="bg-brand-40 hover:bg-brand-60 text-blackOlive px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats Bento */}
            <div className="glass border border-brand-40 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-blackOlive mb-4">Community</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/50 rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-brand">1.2K</div>
                  <div className="text-xs text-gray-600">Readers</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-heritageRed">48</div>
                  <div className="text-xs text-gray-600">Authors</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-burntOrange">156</div>
                  <div className="text-xs text-gray-600">Articles</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-warmRootBrown">24</div>
                  <div className="text-xs text-gray-600">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Mock data
const featuredArticles = [
  {
    id: 1,
    title: "The Future of Sustainable Business",
    excerpt: "How forward-thinking companies are adapting to the new green economy and making sustainability not just ethical but highly profitable.",
    image: "/images/featured-1.jpg",
    category: "Business",
    date: "2024-01-15",
    author: "Sarah Johnson",
    slug: "future-sustainable-business",
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "Tech Innovations Changing Healthcare",
    excerpt: "From AI-powered diagnostics to telemedicine platforms, discover how technology is revolutionizing patient care and medical research.",
    image: "/images/featured-2.jpg",
    category: "Technology",
    date: "2024-01-14",
    author: "Mike Chen",
    slug: "tech-innovations-healthcare",
    readTime: "6 min read"
  }
];

const latestArticles = [
  {
    id: 3,
    title: "Mindfulness in the Workplace",
    excerpt: "How mindfulness practices are boosting productivity, enhancing creativity, and improving employee satisfaction in modern organizations.",
    image: "/images/article-1.jpg",
    category: "Lifestyle",
    date: "2024-01-13",
    author: "Emma Davis",
    slug: "mindfulness-workplace",
    readTime: "5 min read"
  },
  {
    id: 4,
    title: "The Rise of Circular Economy",
    excerpt: "Businesses worldwide are embracing circular models for sustainable growth, waste reduction, and long-term profitability.",
    image: "/images/article-2.jpg",
    category: "Sustainability",
    date: "2024-01-12",
    author: "James Wilson",
    slug: "rise-circular-economy",
    readTime: "7 min read"
  },
  {
    id: 5,
    title: "Digital Transformation Strategies",
    excerpt: "Key strategies and frameworks for successful digital transformation in traditional industries facing disruption.",
    image: "/images/article-3.jpg",
    category: "Technology",
    date: "2024-01-11",
    author: "Lisa Rodriguez",
    slug: "digital-transformation-strategies",
    readTime: "9 min read"
  },
  {
    id: 6,
    title: "Wellness Trends for 2024",
    excerpt: "The top wellness trends that will dominate the health and fitness industry this year, from mental health to holistic approaches.",
    image: "/images/article-4.jpg",
    category: "Health",
    date: "2024-01-10",
    author: "David Kim",
    slug: "wellness-trends-2024",
    readTime: "4 min read"
  }
];