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
        <Link to="/signup/creator">
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