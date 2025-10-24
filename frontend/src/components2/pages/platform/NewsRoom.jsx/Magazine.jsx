import SEO from '@/components2/SEO';
import { Link } from 'react-router-dom';
import { Footer } from '../../LandingPage';
import FeaturedSection from './FeaturedSection';
import ArticleGrid from './ArticleGrid';
import articlesData from './articles.json';
import newsroomData from './newsroom.json';
import { useEffect, useRef, useState } from "react";


export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const mainRef = useRef(null);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    let total = 0;
    let loaded = 0;
    const seen = new WeakSet();
    const SEL = 'img:not([data-preload="false"])';

    const updateProgress = () => setProgress(total ? loaded / total : 1);
    const finishIfDone = () => {
      updateProgress();
      if (loaded >= total) setReady(true);
    };

    const markDone = (img) => {
      if (seen.has(img)) return;
      seen.add(img);
      loaded += 1;
      finishIfDone();
    };

    const watchImages = (imgs) => {
      const list = Array.from(imgs).filter((img) => !seen.has(img));
      if (!list.length) {
        if (total === 0) setReady(true);
        return;
      }
      total += list.length;
      updateProgress();

      list.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          markDone(img);
          return;
        }
        const onLoad = () => cleanup();
        const onError = () => cleanup();
        const cleanup = () => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
          markDone(img);
        };
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onError, { once: true });
      });
    };

    // Initial batch
    watchImages(container.querySelectorAll(SEL));

    // Watch dynamically-added images and re-enter loading state
    const mo = new MutationObserver((mutations) => {
      const newImgs = [];
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches?.(SEL)) newImgs.push(n);
          newImgs.push(...(n.querySelectorAll?.(SEL) || []));
        });
      });
      if (newImgs.length) {
        setReady(false);
        watchImages(newImgs);
      }
    });
    mo.observe(container, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  return (
    <>
      {/* Overlay while images load */}
      {!ready && (
        <div className="fixed inset-0 z-[9999] bg-ivoryNeutral flex flex-col items-center justify-center">
          <div className="h-14 w-14 rounded-full border-4 border-appleGreen/30 border-t-appleGreen animate-spin" />
          <div className="mt-4 text-blackOlive text-sm font-medium">
            Loading… {Math.round(progress * 100)}%
          </div>
        </div>
      )}

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
          <main className="flex-1 transition-all duration-300 pt-16 min-h-screen">
            <div
              ref={mainRef}
              className={`lg:p-4 lg:ml-80 lg:pl-6 pt-4 sm:p-2 sm:pt-16 overflow-x-hidden
                          transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      {/* <Footer/> */}
    </>
  );
}

/* Tip:
   - To prevent a specific image from blocking initial load, render it with:
     <img src="..." alt="..." data-preload="false" loading="lazy" />
*/


export function Navbar({ onMenuToggle, isSidebarOpen }) {
  return (
    <nav
      className="fixed top-0 left-0  right-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-8xl mx-auto px-4 py-4 flex items-center justify-between">
      {/* Centered Logo with Magazine Badge - Mobile Optimized */}
<div className="absolute left-1/2 transform -translate-x-1/2">
  <div className="flex items-center  pr-2  gap-2 sm:gap-3">
    {/* Main Logo - Text hidden on mobile */}
    <Link to="/" className="flex items-center gap-2 group/logo">
      <div
        className="h-8 w-8 rounded-xl overflow-hidden transition-all duration-300 group-hover/logo:scale-110"
        style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}
      >
        <img
          src="https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-white_ndemtl.png"
          alt="E-strateji"
          className="h-7 w-7 object-contain m-auto pt-1"
           data-preload="false" loading="lazy"
        />
      </div>
      {/* Text hidden on mobile, shown on sm and up */}
      <span className="text-lg font-semibold text-gray-900 hidden sm:block">
        E-strateji
      </span>
    </Link>

    {/* Magazine Badge - Compact on mobile */}
    <div className="relative">
      <Link 
        to="/magazine" 
        className="group/magazine inline-flex items-center gap-1 sm:gap-2 border bg-gradient-to-r from-green-50 to-red-50 hover:from-green-100 hover:to-red-100 text-gray-800 text-xs sm:text-sm font-semibold py-.5 sm:py-1 px-3 sm:px-4  border-transparent bg-clip-padding transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(141, 182, 0, 0.1), rgba(193, 39, 45, 0.1))',
          borderImage: 'linear-gradient(135deg, #8DB600, #C1272D) 1',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Magazine Icon - Always visible */}
        {/* <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md overflow-hidden flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}>
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
         */}
        {/* Text hidden on mobile, shown on md and up */}
        <span className="hidden  text-lg md:block bg-gradient-to-r from-green-700 to-red-700 bg-clip-text text-transparent font-bold">
          Magazine
        </span>
        
        {/* Mobile: Show "Mag" abbreviation */}
        <span className="md:hidden text-lg bg-gradient-to-r from-green-700 to-red-700 bg-clip-text text-transparent ">
          Magazine
        </span>
      </Link>

      {/* New Content Indicator - Hidden on smallest screens */}
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping opacity-75 hidden sm:block"></div>
    </div>
  </div>
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

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full pt-20 w-80 bg-gradient-to-br from-gray-50 to-white z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:hidden
      `}>
    

        {/* Mobile Buttons */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-center font-medium transition-colors duration-200 text-sm">
              Subscribe
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-3 py-2 rounded-lg text-center font-medium transition-colors duration-200 text-sm">
              Latest Issue
            </button>
          </div>
        </div>

        {/* Mobile Navigation Content */}
        <div className="flex-1 p-4">
          {/* Bento Navigation Grid */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Magazine', path: '/magazine', color: 'bg-green-500' },
                { name: 'Newsroom', path: '/news', color: 'bg-red-500' },
                { name: 'Podcasts', path: '/magazine', color: 'bg-orange-500' },
                { name: 'Home', path: '/', color: 'bg-amber-700' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`${item.color} text-white p-2 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105 hover:shadow-md text-sm`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Full width navigation items */}
            {/* <div className="space-y-1.5">
              {[
                { name: 'Technology', path: '/technology' },
                { name: 'Sustainability', path: '/sustainability' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-900 text-center font-medium transition-colors duration-200 text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div> */}
          </div>

      {/* Latest Cover — Simple Gradient Border + Single Badge */}
<div className="max-w-sm pb-10">
  <a href="#" className="group block relative cursor-pointer" aria-label="Open latest magazine edition">
    {/* Gradient border frame */}
    <div className="rounded-2xl p-[2px] bg-gradient-to-br from-appleGreen to-heritageRed">
      {/* Inner card */}
      <div className="relative rounded-2xl overflow-hidden bg-ivory">
        {/* Cover image */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src="https://freight.cargo.site/w/1000/q/75/i/040ca37aba5557cc39f79248abafd89a68a31f85949dbfcf82bcf7edba2cc4b2/i-D-X-LOUS.jpg"
            alt="E-strateji Magazine — Latest Edition Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
             data-preload="false" loading="lazy"
          />
        </div>

        {/* Subtle bottom fade for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Single badge — 'LATEST EDITION' */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1 rounded-full text-xs font-bold text-ivory shadow-lg
                          bg-gradient-to-r from-appleGreen to-heritageRed">
            LATEST EDITION
          </div>
        </div>
      </div>
    </div>
  </a>
</div>


          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="text-xs font-bold text-green-600">24</div>
              <div className="text-xs text-gray-600">Articles</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="text-xs font-bold text-red-600">12</div>
              <div className="text-xs text-gray-600">Podcasts</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="text-xs font-bold text-orange-600">8</div>
              <div className="text-xs text-gray-600">Videos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Fixed, No Scroll */}
      <div className="hidden lg:block fixed top-26 px-6 left-0 h-[calc(100vh-8rem)] w-80  z-30 overflow-visible">
        <div className="h-full flex flex-col ">
          {/* Desktop Buttons */}
   

          {/* Desktop Navigation Content */}
          <div className="flex-1 overflow-visible">
            {/* Bento Navigation Grid */}
            <div className="space-y-3  mb-6   ">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Magazine', path: '/magazine', color: 'bg-green-500' },
                  { name: 'Newsroom', path: '/news', color: 'bg-red-500' },
                  { name: 'Podcasts', path: '/podcasts', color: 'bg-orange-500' },
                  { name: 'Home', path: '/', color: 'bg-amber-700' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${item.color} text-white p-2 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105 hover:shadow-md text-sm`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Full width navigation items */}
              <div className="space-y-1.5">
                {[
                  { name: 'Technology', path: '/technology' },
                  { name: 'Sustainability', path: '/sustainability' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-900 text-center font-medium transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
{/* Latest Cover — Simple Gradient Border + Single Badge */}
<div className="max-w-sm pb-10">
  <a href="#" className="group block relative cursor-pointer" aria-label="Open latest magazine edition">
    {/* Gradient border frame */}
    <div className="rounded-2xl p-[2px] bg-gradient-to-br from-appleGreen to-heritageRed">
      {/* Inner card */}
      <div className="relative rounded-2xl overflow-hidden bg-ivory">
        {/* Cover image */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src="https://freight.cargo.site/w/1000/q/75/i/040ca37aba5557cc39f79248abafd89a68a31f85949dbfcf82bcf7edba2cc4b2/i-D-X-LOUS.jpg"
            alt="E-strateji Magazine — Latest Edition Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
             data-preload="false" loading="lazy"
          />
        </div>

        {/* Subtle bottom fade for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Single badge — 'LATEST EDITION' */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1 rounded-full text-xs font-bold text-ivory shadow-lg
                          bg-gradient-to-r from-appleGreen to-heritageRed">
            LATEST EDITION
          </div>
        </div>
      </div>
    </div>
  </a>
</div>


            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-bold text-green-600">24</div>
                <div className="text-xs text-gray-600">Articles</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-bold text-red-600">12</div>
                <div className="text-xs text-gray-600">Podcasts</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-bold text-orange-600">8</div>
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
  const articles = articlesData?.articles ?? [];
  const news = newsroomData?.newsroom ?? [];
  const mainStory = articles.at(-1) ?? null;

  // Combine articles and news for featured section (first 2 articles)
  const featuredArticles = articles.slice(0, 2);
  
  // Latest articles (remaining after the first 2), excluding mainStory
  const latestArticles = articles
    .slice(0)
    .filter(a => (mainStory ? a.id !== mainStory.id : true));
  
  // Latest news (first 3 news items)
  const latestNews = news.slice(0, 3);
   const latestaArticles = [
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
  
  // const mainStory = {
  //   id: 1,
  //   title: "Digital Education Revolution in the Caribbean",
  //   excerpt: "How online learning platforms are transforming education access across Caribbean islands, bridging geographical barriers and creating new opportunities for students.",
  //   image: "/images/caribbean-education.jpg",
  //   category: "Cover Story",
  //   date: "2024-01-15",
  //   author: "Dr. Simone Clarke",
  //   slug: "digital-education-caribbean",
  //   readTime: "8 min read",
  //   tags: ["Education", "Technology", "Caribbean", "Innovation"]
  // };
  return (
    <Layout>
      <SEO
        title="E-stratèji Magazine - Caribbean Education & Culture"
        description="Discover stories, insights, and educational resources focused on Afro-Caribbean communities and digital learning transformation."
        canonical="/magazine"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center mt-5 rounded-t-2xl  justify-center bg-gradient-to-br from-gray-50 to-white">

        {/* Animated Orbs — Vibrant, Big, Organic */}
<div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
  {/* Apple Green — large hero orb */}
  <div
    className="absolute -top-32 -left-28 md:-top-40 md:-left-36
               w-[28rem] h-[28rem] md:w-[34rem] md:h-[34rem]
               rounded-full opacity-70 blur-3xl animate-orb-1 animate-hue will-change-transform"
    style={{
      background:
        `radial-gradient(ellipse at 40% 40%,
          color-mix(in oklab, var(--appleGreen) 90%, white 10%) 0%,
          color-mix(in oklab, var(--appleGreen) 80%, transparent 20%) 28%,
          color-mix(in oklab, var(--appleGreen) 55%, transparent 45%) 55%,
          transparent 75%)`
    }}
  />

  {/* Heritage Red — right mid orb */}
  <div
    className="absolute top-1/3 -right-24 md:-right-40
               w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]
               rounded-full opacity-20 blur-2xl animate-orb-2 will-change-transform"
    style={{
      background:
        `radial-gradient(ellipse at 40% 20%,
          color-mix(in oklab, var(--heritageRed) 85%, white 15%) 0%,
          color-mix(in oklab, var(--heritageRed) 70%, transparent 30%) 25%,
          color-mix(in oklab, var(--heritageRed) 45%, transparent 55%) 42%,
          transparent 50%)`
    }}
  />

  {/* Burnt Orange — bottom glow */}
  <div
    className="absolute -bottom-32 left-1/5 md:left-1/4
               w-[24rem] h-[24rem] md:w-[30rem] md:h-[30rem]
               rounded-full opacity-60 blur-3xl animate-orb-3 will-change-transform"
    style={{
      background:
        `radial-gradient(ellipse at 50% 60%,
          color-mix(in oklab, var(--burntOrange) 85%, white 15%) 0%,
          color-mix(in oklab, var(--burntOrange) 65%, transparent 35%) 35%,
          color-mix(in oklab, var(--burntOrange) 40%, transparent 60%) 60%,
          transparent 80%)`
    }}
  />



  {/* Optional: faint vignette to contain color spill */}
  {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06)_100%)]" /> */}
</div>

        <div className="max-w-6xl mx-auto px-4 w-full py-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
       {/* Main Story Content */}
<div className="space-y-6 relative overflow-hidden z-20">



  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-lg">
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
    <span>{mainStory.read_time} min read</span>
  </div>

  <div className="flex flex-wrap gap-2">
    {mainStory.keywords.slice(0, 4).map(keyword => (
      <span key={keyword} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
        #{keyword}
      </span>
    ))}
  </div>

  <div className="flex flex-col sm:flex-row gap-3">
    <Link 
      to={`/article/${mainStory.slug}`}
      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
    >
      Read Full Story
    </Link>
    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
      Share
    </button>
  </div>
</div>

            {/* Main Story Visual */}
            <div className="relative z-20">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div 
                  className="aspect-[4/3] bg-cover bg-center rounded-xl flex items-end justify-start p-6"
                  style={{ backgroundImage: `url(${mainStory.featured_image})` }}
                >
                  <div className="text-left text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Featured Insight</h3>
                    <p className="text-white/80 text-sm">Building for reality, not perfect conditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-16">
          {/* Latest News Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
                <p className="text-gray-600 mt-2">Stay updated with the latest developments in Caribbean education and technology</p>
              </div>
              <Link 
                to="/news"
                className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                View All News
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {latestNews.map((news) => (
                <div key={news.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {news.category}
                    </span>
                    <span className="text-gray-500 text-sm">{news.date}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      to={`/news/${news.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {news.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {news.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{news.read_time} min read</span>
                    <Link 
                      to={`/news/${news.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Articles Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
                <p className="text-gray-600 mt-2">In-depth articles from our founders and featured writers</p>
              </div>
            </div>
            <FeaturedSection articles={featuredArticles} />
          </section>

          {/* Latest Articles Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                <p className="text-gray-600 mt-2">Explore our growing collection of educational content</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{latestArticles.length} articles</span>
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

