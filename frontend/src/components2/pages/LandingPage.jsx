import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components2/ui/button';
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';
import VerticalCarousel, { VerticalCarouselMobile } from '../ui/verticalCarousel';
import { useAuth } from '@/AuthContext';
import Navbar from '../ui/Navbar';

// Brand Colors
const colors = {
  clay: '#EA7125',
  leaf: '#66A569',
  indigo: '#2C365E',
  cream: '#FAF8F4',
  charcoal: '#222222'
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function LandingPage() {

    const auth = useAuth();
    const user = auth?.user || null;
    const role = auth?.role || null;






  return (
    <div className="w-full text-gray-900 bg-[#FAF8F4] overflow-x-hidden">
        <Navbar user={user}/>

      {/* 🎯 Hero Section - Creators */}
      <section className="relative w-full min-h-screen bg-[#FAF8F4] px-4 sm:px-6 py-10 sm:py-20 overflow-hidden">
  {/* Animated Background Elements */}
  <motion.div
    className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#66A569] opacity-10 z-0"
    animate={{ scale: [1, 1.2, 1], rotate: [0, 20, -10, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
  />
  <motion.div
    className="absolute bottom-[-120px] right-[-120px] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full bg-[#EA7125] opacity-10 z-0"
    animate={{ scale: [1, 0.8, 1.1, 1], rotate: [0, -30, 15, 0] }}
    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
  />

  {/* Lottie Background Animation - Centered */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
  >
    <div className="w-full max-w-2xl h-auto pb-40 opacity-80">
      <Lottie animationData={bgAnimation} loop autoplay />
    </div>
  </motion.div>

  <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 sm:gap-10">
    {/* Text Content - Always centered on mobile, left-aligned on desktop */}
    <motion.div
      className="w-full lg:w-1/2 max-w-2xl text-center lg:text-left relative   mb-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-3xl sm:text-4xl md:text4xl lg:text-5xl font-bold leading-tight mb-4 md:pt-30  py-8 sm:mb-6">
        Empower Haiti Through<br />
        <span className="text-[#EA7125]">Knowledge Sharing</span>
      </h1>
      <p className="text-[#2C365E] text-base sm:text-lg md:text-2xl mb-6 sm:mb-8">
        E-strateji provides Haitian creators with AI-powered tools to create, share, and monetize educational content—online or offline.
      </p>
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
        <Link to="/creator/onboarding">
          <Button size="lg" className="bg-[#EA7125] text-white hover:bg-[#EA7125]/90">
            Become a Creator
          </Button>
        </Link>
        <Link to="/signup/learner">
          <Button variant="outline" size="lg" className="border-[#EA7125] text-[#EA7125] hover:bg-[#EA7125]/10">
            Explore Courses
          </Button>
        </Link>
      </div>
    </motion.div>

    {/* Vertical Carousel - Positioned differently on mobile vs desktop */}
    <div className="w-full lg:w-[400px] max-h-[300px]  hidden lg:block">
      <VerticalCarousel />
    </div>

  <div className="w-full block min-h-[600px] lg:hidden">
      <h2 className="text-md font-semibold text-white text-center bg-[#EA7125]  mb-0"> Top Creators</h2>
      <VerticalCarouselMobile />
      <div className="border-t border-gray-300 my-6" /> {/* 🔹 Mobile divider */}
    </div>
  </div>
</section>

      {/* 🛠️ Platform Features - Bento Grid */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#2C365E]"
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
        >
          Creator Tools Built for Haiti
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Assistant Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={0}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#EA7125]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EA7125]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">AI Content Assistant</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Automatically generate quizzes, transcripts, and summaries from your videos in Kreyòl, French, or English.
            </p>
          </motion.div>

          {/* Offline Access Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={1}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#66A569]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#66A569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">Offline-First System</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Content is automatically optimized for offline access, reaching learners with limited internet connectivity.
            </p>
          </motion.div>

          {/* Course Builder Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={2}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#2C365E]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2C365E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">Course Builder</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Step-by-step guidance to structure your knowledge into effective learning modules with multimedia support.
            </p>
          </motion.div>

          {/* Media Package Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={3}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#EA7125]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EA7125]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">Media Package</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Professional thumbnails, intro/outro templates, and branding tools to make your content stand out.
            </p>
          </motion.div>

          {/* Top Creators Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={4}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#66A569]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#66A569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">Top Haitian Creators</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Join a network of Haiti's most impactful educators and get featured in our discovery platform.
            </p>
          </motion.div>

          {/* Customizable Page Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all"
            custom={5}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#2C365E]/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2C365E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2C365E]">Professional Landing Page</h3>
            </div>
            <p className="text-[#2C365E]/80">
              Customizable creator profile with your branding, course catalog, and learner testimonials.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🎓 Learner Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2C365E]/5 to-[#66A569]/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2C365E]">
              Learn Practical Skills<br />
              <span className="text-[#EA7125]">For Haiti's Reality</span>
            </h2>
            <p className="text-lg text-[#2C365E]/80 mb-6">
              Access courses designed specifically for Haitian learners, available online or offline, in your preferred language.
            </p>
            <div className="space-y-4">
              {[
                "Agriculture & Farming Techniques",
                "Small Business & Entrepreneurship",
                "Health & Wellness Education",
                "Technology & Digital Skills",
                "Language Learning (Kreyòl, French, English)"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#EA7125]"></div>
                  <span className="text-[#2C365E]">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/signup/learner" className="inline-block mt-8">
              <Button size="lg" className="bg-[#66A569] hover:bg-[#66A569]/90 text-white">
                Browse All Courses
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-lg">
              <h3 className="font-semibold text-[#2C365E] mb-2">Offline Learning</h3>
              <p className="text-sm text-[#2C365E]/80">Download courses when you have internet, learn anytime</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-lg">
              <h3 className="font-semibold text-[#2C365E] mb-2">Kreyòl Support</h3>
              <p className="text-sm text-[#2C365E]/80">All content available in Haiti's native language</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-lg">
              <h3 className="font-semibold text-[#2C365E] mb-2">Community Q&A</h3>
              <p className="text-sm text-[#2C365E]/80">Get answers from creators and other learners</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-lg">
              <h3 className="font-semibold text-[#2C365E] mb-2">Progress Tracking</h3>
              <p className="text-sm text-[#2C365E]/80">Save your place and track your learning journey</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🌟 Testimonial Section */}
      <section className="py-20 px-6 bg-[#2C365E] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12"
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            Impact Stories from Haiti
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
              custom={0}
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
            >
              <p className="text-lg italic mb-6">
                "With E-strateji, I've been able to share my agricultural knowledge with hundreds of farmers in rural areas who don't have reliable internet."
              </p>
              <p className="font-bold">Jean-Pierre, Agricultural Expert</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
              custom={1}
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
            >
              <p className="text-lg italic mb-6">
                "The AI tools helped me create quizzes and transcripts in Kreyòl, saving me hours of work. Now I can focus on teaching."
              </p>
              <p className="font-bold">Marie, Language Teacher</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📣 Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#EA7125] to-[#EA7125]/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            Ready to Make an Impact?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto"
            custom={1}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            Join Haiti's knowledge revolution today—as a creator or a learner.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            custom={2}
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
          >
            <Link to="/signup/creator">
              <Button size="lg" className="bg-white text-[#EA7125] hover:bg-white/90">
                Become a Creator
              </Button>
            </Link>
            <Link to="/signup/learner">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Start Learning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


/** ========================================================================================================================================================= */
/** ========================================================================================================================================================= */


// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

/**
 * E‑strateji Landing Page (Creator‑First) — Tailwind + DaisyUI
 * Emphasis: Creators first, while showcasing platform tech, mobile apps, AI assistants, and media packages.
 * Adds: Rotating hero (3 banners), AI Assistants section, Tech & Mobile, Media Packages (up to 1M impressions),
 *       Creator Benefits, Learner section (secondary emphasis), and polished pricing/FAQ.
 */

// export  function EstratejiLanding() {
//   return (
//     <div className="min-h-screen bg-base-100 text-base-content">
//       <Navbar />
//       <HeroRotator />
//       <CreatorPrimer />
//       <LogoStrip />
//       <CreatorBenefits />
//       <AIHelpers />
//       <TechAndMobile />
//       <MediaPackages />
//       <SplitMediaA />
//       <StatsBand />
//       <LearnerSection />
//       <Testimonials />
//       <Pricing />
//       <FAQ />
//       <FinalCTA />
//       <Footer />
//     </div>
//   );
// }

// function Navbar() {
//   return (
//     <div className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-300">
//       <div className="container mx-auto px-4">
//         <div className="flex-1">
//           <a href="#" className="btn btn-ghost text-xl font-extrabold">E‑strateji</a>
//         </div>
//         <div className="flex-none hidden md:flex gap-1">
//           <a href="#creator" className="btn btn-ghost">Creators</a>
//           <a href="#tech" className="btn btn-ghost">Tech</a>
//           <a href="#pricing" className="btn btn-ghost">Pricing</a>
//           <a href="#faq" className="btn btn-ghost">FAQ</a>
//         </div>
//         <div className="flex-none gap-2">
//           <a className="btn btn-ghost">Sign in</a>
//           <a className="btn btn-primary">Become a Creator</a>
//         </div>
//       </div>
//     </div>
//   );
// }

// /** HERO — Rotating 3 banners */
// function HeroRotator() {
//   const slides = [
//     {
//       title: "Launch your creator brand in minutes",
//       sub: "Pick a theme, upload your banner, and publish a premium page—no code.",
//       cta1: "Start free",
//       cta2: "See creator pages",
//       img: "https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=1400&auto=format&fit=crop",
//     },
//     {
//       title: "AI assistants that help you ship",
//       sub: "From transcript cleanup to quiz generation and course outlines—done in clicks.",
//       cta1: "Try AI helpers",
//       cta2: "How it works",
//       img: "https://images.unsplash.com/photo-1555255707-c07966088b7a?q=80&w=1400&auto=format&fit=crop",
//     },
//     {
//       title: "Reach 1M+ impressions with media packages",
//       sub: "Podcasts, papers, and blog features to amplify your course launches.",
//       cta1: "View packages",
//       cta2: "Talk to us",
//       img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop",
//     },
//   ];

//   const [idx, setIdx] = useState(0);
//   useEffect(() => {
//     const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
//     return () => clearInterval(t);
//   }, []);

//   const s = slides[idx];

//   return (
//     <section className="relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
//       <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-10 items-center">
//         <div>
//           <motion.h1
//             key={`title-${idx}`}
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="text-4xl md:text-6xl font-black leading-tight"
//           >
//             {s.title}
//           </motion.h1>
//           <motion.p
//             key={`sub-${idx}`}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35 }}
//             className="mt-4 text-lg opacity-80"
//           >
//             {s.sub}
//           </motion.p>
//           <div className="mt-8 flex flex-wrap gap-3">
//             <a className="btn btn-primary">{s.cta1}</a>
//             <a className="btn btn-outline">{s.cta2}</a>
//           </div>
//           <ul className="mt-6 text-sm opacity-70 list-disc pl-5 space-y-1">
//             <li>Creator‑first onboarding</li>
//             <li>Offline‑ready modules</li>
//             <li>Integrated payments & analytics</li>
//           </ul>
//         </div>
//         <motion.div
//           key={`img-${idx}`}
//           initial={{ opacity: 0, scale: 0.98 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           <div className="mockup-window border border-base-300 bg-base-200">
//             <div className="p-4 md:p-8">
//               <img className="rounded-box" src={s.img} alt="Hero preview" />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Dots */}
//       <div className="flex gap-2 justify-center pb-6">
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setIdx(i)}
//             className={`btn btn-xs ${i === idx ? 'btn-primary' : 'btn-outline'}`}
//           >
//             {i + 1}
//           </button>
//         ))}
//       </div>
//     </section>
//   );
// }

// /** CREATOR FIRST PRIMER */
// function CreatorPrimer() {
//   return (
//     <section id="creator" className="py-10">
//       <div className="container mx-auto px-4 text-center">
//         <div className="badge badge-primary">Creator‑first</div>
//         <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
//           Create once. Publish everywhere. <span className="text-primary">Own your brand.</span>
//         </h2>
//         <p className="max-w-3xl mx-auto mt-3 opacity-80">
//           E‑strateji gives you a premium, customizable landing page, AI assistants that speed up production,
//           and distribution packages to grow your audience.
//         </p>
//         <div className="mt-6 flex justify-center gap-3">
//           <a className="btn btn-primary">Become a Creator</a>
//           <a className="btn btn-outline">See how it works</a>
//         </div>
//       </div>
//     </section>
//   );
// }

// function LogoStrip() {
//   return (
//     <section className="py-10">
//       <div className="container mx-auto px-4">
//         <p className="text-center text-sm uppercase tracking-widest opacity-60">Trusted by creators & organizations</p>
//         <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-70">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="h-10 bg-base-200 rounded animate-pulse" />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** CREATOR BENEFITS */
// function CreatorBenefits() {
//   const items = [
//     { icon: "🎨", title: "Polished, professional pages", body: "Three distinct themes + two colorways. Your brand, your layout." },
//     { icon: "🤖", title: "AI Assistants", body: "Auto‑outline courses, clean transcripts, generate quizzes, summarize lectures." },
//     { icon: "📱", title: "Mobile apps", body: "Learners watch, read, and quiz on the go—online or offline." },
//     { icon: "💳", title: "Payments & analytics", body: "Enrollments, revenue, and retention in one place." },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Built for serious creators</h3>
//         <p className="text-center opacity-70 mt-2">Premium theming, AI speed, and distribution that compounds.</p>
//         <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {items.map((f) => (
//             <div key={f.title} className="card bg-base-200 hover:shadow-lg transition">
//               <div className="card-body">
//                 <div className="text-3xl">{f.icon}</div>
//                 <h4 className="card-title">{f.title}</h4>
//                 <p className="opacity-80">{f.body}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** AI HELPERS */
// function AIHelpers() {
//   const helpers = [
//     { title: "Course Outliner", desc: "Turn ideas into a structured syllabus." },
//     { title: "Transcript Cleaner", desc: "Fix titles, sections, and remove filler words." },
//     { title: "Quiz Generator", desc: "Auto‑create MCQs from your content." },
//     { title: "Summary Bot", desc: "Readable abstracts for blogs and social." },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <div className="hero bg-base-200 rounded-2xl">
//           <div className="hero-content flex-col lg:flex-row gap-10">
//             <img className="max-w-md rounded-box border border-base-300"
//                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
//                  alt="AI helpers" />
//             <div>
//               <h3 className="text-3xl font-extrabold">Work faster with AI assistants</h3>
//               <p className="mt-2 opacity-80">Assistants integrate into your creator studio—optional, private‑aware, and designed to save time.</p>
//               <div className="mt-4 grid sm:grid-cols-2 gap-3">
//                 {helpers.map((h) => (
//                   <div key={h.title} className="p-4 rounded-xl border border-base-300 bg-base-100">
//                     <h4 className="font-bold">{h.title}</h4>
//                     <p className="opacity-80 text-sm">{h.desc}</p>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-6 join">
//                 <button className="btn btn-primary join-item">Try AI helpers</button>
//                 <button className="btn btn-outline join-item">Privacy & safety</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /** TECH + MOBILE */
// function TechAndMobile() {
//   const tech = [
//     { k: "Offline‑first", v: "PWA + local storage of modules" },
//     { k: "Video + Docs", v: "Transcripts, captions, and blob playback" },
//     { k: "Mobile Apps", v: "iOS & Android experiences" },
//     { k: "APIs", v: "Clean REST for content & analytics" },
//   ];
//   return (
//     <section id="tech" className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <div className="grid lg:grid-cols-2 gap-10 items-center">
//           <div>
//             <h3 className="text-3xl font-extrabold">Serious tech under the hood</h3>
//             <p className="mt-3 opacity-80">We combine offline‑ready delivery with secure APIs and a polished creator studio—optimized for low‑internet contexts.</p>
//             <ul className="mt-4 space-y-2">
//               {tech.map((t) => (
//                 <li key={t.k} className="flex items-center gap-2">
//                   <span className="badge badge-outline badge-sm">{t.k}</span>
//                   <span className="opacity-80">{t.v}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div>
//             <div className="mockup-phone border-primary">
//               <div className="camera"></div>
//               <div className="display">
//                 <div className="artboard artboard-demo phone-1 bg-base-100">
//                   <div className="p-4">
//                     <p className="font-bold">E‑strateji Mobile</p>
//                     <p className="text-sm opacity-70">Offline playback · Quiz resume · Sync on reconnect</p>
//                     <div className="mt-4 h-40 bg-base-200 rounded-box" />
//                     <div className="mt-3 h-6 bg-base-200 rounded" />
//                     <div className="mt-2 h-6 bg-base-200 rounded" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /** MEDIA PACKAGES */
// function MediaPackages() {
//   const packs = [
//     { name: "Starter Media", reach: "Up to 100k impressions", items: ["Blog feature", "Newsletter plug", "Social posts"] },
//     { name: "Growth Media", reach: "Up to 500k impressions", items: ["Podcast guest", "Blog + newsletter", "Shorts pack"] },
//     { name: "Launch Max", reach: "Up to 1M impressions", items: ["Podcast + panel", "Whitepaper excerpt", "Multi‑blog syndication"] },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Amplify with media packages</h3>
//         <p className="text-center opacity-70">Podcasts • Papers • Blogs • Shorts</p>
//         <div className="mt-10 grid md:grid-cols-3 gap-6">
//           {packs.map((p) => (
//             <div key={p.name} className="card bg-base-100 border border-base-300 shadow">
//               <div className="card-body">
//                 <div className="flex items-baseline justify-between">
//                   <h4 className="card-title">{p.name}</h4>
//                   <div className="badge badge-primary">{p.reach}</div>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {p.items.map((i) => (
//                     <li key={i} className="flex items-center gap-2"><span>✔️</span> {i}</li>
//                   ))}
//                 </ul>
//                 <div className="card-actions mt-6">
//                   <button className="btn btn-outline">Request details</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** Creator Page explainer split (kept) */
// function SplitMediaA() {
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
//         <div className="order-2 lg:order-1">
//           <h3 className="text-3xl font-extrabold">Themeable Creator Pages</h3>
//           <p className="mt-3 opacity-80">
//             Choose a layout, pick a colorway, add your banner and logo, and publish. We handle the rest.
//           </p>
//           <ul className="mt-4 space-y-2">
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">AA</span> Accessible contrasts & keyboard nav</li>
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">i18n</span> English • Kreyòl • Français</li>
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">PWA</span> Offline‑friendly previews</li>
//           </ul>
//         </div>
//         <div className="order-1 lg:order-2">
//           <div className="rounded-box overflow-hidden border border-base-300">
//             <img
//               src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1400&auto=format&fit=crop"
//               alt="Theme preview"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function StatsBand() {
//   const stats = [
//     { k: "Creators", v: "2,400+" },
//     { k: "Learners", v: "120k" },
//     { k: "Avg. completion", v: "86%" },
//     { k: "Countries", v: "35" },
//   ];
//   return (
//     <section className="py-14">
//       <div className="container mx-auto px-4">
//         <div className="stats stats-vertical md:stats-horizontal w-full shadow">
//           {stats.map((s) => (
//             <div key={s.k} className="stat">
//               <div className="stat-title">{s.k}</div>
//               <div className="stat-value text-primary">{s.v}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** LEARNER (secondary emphasis) */
// function LearnerSection() {
//   const items = [
//     { title: "Learn anywhere", body: "Offline modules keep you progressing without stable internet." },
//     { title: "Bilingual content", body: "English • Kreyòl • Français support from the start." },
//     { title: "Track progress", body: "Resume videos, complete quizzes, sync when online." },
//   ];
//   return (
//     <section className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <div className="badge">For Learners</div>
//         <h3 className="text-3xl md:text-4xl font-extrabold mt-2">A better learning experience</h3>
//         <div className="mt-6 grid md:grid-cols-3 gap-4">
//           {items.map((i) => (
//             <div key={i.title} className="p-6 rounded-2xl border border-base-300 bg-base-100">
//               <h4 className="font-bold">{i.title}</h4>
//               <p className="opacity-80 mt-1">{i.body}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Testimonials() {
//   const items = [
//     {
//       quote: "E‑strateji let me teach without worrying about bandwidth. My students finally keep up.",
//       name: "Marsha S.",
//       role: "Business Coach",
//     },
//     {
//       quote: "Uploading videos and auto‑quizzes saved me hours.",
//       name: "Wilgens M.",
//       role: "Finance Educator",
//     },
//     {
//       quote: "The themeable page made my brand feel premium from day one.",
//       name: "Vanessa A.",
//       role: "Creator",
//     },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl font-extrabold text-center">Creators are winning with E‑strateji</h3>
//         <div className="mt-8 carousel w-full">
//           {items.map((t, idx) => (
//             <div key={idx} id={`slide-${idx}`} className="carousel-item w-full justify-center">
//               <div className="max-w-3xl text-center">
//                 <p className="text-xl md:text-2xl font-semibold">“{t.quote}”</p>
//                 <p className="mt-4 opacity-70">{t.name} • {t.role}</p>
//                 <div className="mt-6 join">
//                   {items.map((_, i) => (
//                     <a key={i} href={`#slide-${i}`} className={`btn btn-sm join-item ${i===idx? 'btn-primary':'btn-outline'}`}>{i+1}</a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Pricing() {
//   const tiers = [
//     {
//       name: "Starter",
//       price: "$0",
//       desc: "Launch your first course",
//       features: ["1 course", "Theme pages", "Email support"],
//       cta: "Start free",
//       popular: false,
//     },
//     {
//       name: "Creator",
//       price: "$29/mo",
//       desc: "Grow your audience",
//       features: ["Unlimited courses", "Quizzes & transcripts", "Analytics"],
//       cta: "Choose Creator",
//       popular: true,
//     },
//     {
//       name: "Studio",
//       price: "$99/mo",
//       desc: "Scale with teams",
//       features: ["Team seats", "Advanced offline", "Priority support"],
//       cta: "Go Studio",
//       popular: false,
//     },
//   ];
//   return (
//     <section id="pricing" className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Simple, creator‑friendly pricing</h3>
//         <div className="mt-10 grid md:grid-cols-3 gap-6">
//           {tiers.map((t) => (
//             <div key={t.name} className={`card bg-base-100 border ${t.popular ? 'border-primary' : 'border-base-300'} shadow-lg`}>
//               <div className="card-body">
//                 <div className="flex items-baseline justify-between">
//                   <h4 className="card-title">{t.name}</h4>
//                   {t.popular && <div className="badge badge-primary">Popular</div>}
//                 </div>
//                 <p className="text-4xl font-black">{t.price}</p>
//                 <p className="opacity-70">{t.desc}</p>
//                 <ul className="mt-4 space-y-2">
//                   {t.features.map((f) => (
//                     <li key={f} className="flex items-center gap-2"><span className="i">✔️</span> {f}</li>
//                   ))}
//                 </ul>
//                 <div className="card-actions mt-6">
//                   <button className={`btn ${t.popular ? 'btn-primary' : 'btn-outline'}`}>{t.cta}</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function FAQ() {
//   const faqs = [
//     {
//       q: "Can learners access content offline?",
//       a: "Yes. Modules are cached with transcripts and quizzes. Progress syncs when back online.",
//     },
//     {
//       q: "Do I need a website to start?",
//       a: "No. Your themeable Creator Page is your branded hub with courses and media.",
//     },
//     {
//       q: "How do media packages work?",
//       a: "Pick a tier and we coordinate podcasts, papers/blogs, and social distribution around your launch.",
//     },
//   ];
//   return (
//     <section id="faq" className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl font-extrabold text-center">Frequently asked questions</h3>
//         <div className="mt-8 join join-vertical w-full">
//           {faqs.map((f, i) => (
//             <div key={i} className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
//               <input type="checkbox" />
//               <div className="collapse-title text-lg font-medium">{f.q}</div>
//               <div className="collapse-content opacity-80">
//                 <p>{f.a}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function FinalCTA() {
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <div className="hero bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl">
//           <div className="hero-content text-center">
//             <div className="max-w-xl">
//               <h2 className="text-3xl md:text-4xl font-black">Ready to launch your creator brand?</h2>
//               <p className="mt-2 opacity-90">Premium pages. AI speed. Distribution that scales.</p>
//               <div className="mt-6 flex flex-wrap justify-center gap-3">
//                 <a className="btn">Become a Creator</a>
//                 <a className="btn btn-outline">Talk to our team</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <footer className="footer p-10 bg-base-100 border-t border-base-300">
//       <nav>
//         <h6 className="footer-title">Product</h6>
//         <a className="link link-hover">Features</a>
//         <a className="link link-hover">Pricing</a>
//         <a className="link link-hover">Changelog</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Company</h6>
//         <a className="link link-hover">About</a>
//         <a className="link link-hover">Careers</a>
//         <a className="link link-hover">Press</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Support</h6>
//         <a className="link link-hover">Help center</a>
//         <a className="link link-hover">Contact</a>
//         <a className="link link-hover">Status</a>
//       </nav>
//       <div>
//         <h6 className="footer-title">E‑strateji</h6>
//         <p className="opacity-70">Ship knowledge. Anywhere.</p>
//         <form className="form-control w-80 mt-3">
//           <label className="label">
//             <span className="label-text">Get updates</span>
//           </label>
//           <div className="join">
//             <input type="email" placeholder="you@example.com" className="input input-bordered join-item" />
//             <button className="btn btn-primary join-item">Subscribe</button>
//           </div>
//         </form>v
//       </div>
//     </footer>
//   );
// }
