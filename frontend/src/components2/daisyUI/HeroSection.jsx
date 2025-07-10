// components2/daisyUI/HeroSection.jsx
import { motion } from 'framer-motion';
import { Button } from '@/components2/ui/button';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[80vh] bg-coconut text-gray-900 px-6 py-20 overflow-hidden">
      {/* Background Animated Blobs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-leaf opacity-10 z-0"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 20, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full bg-clay opacity-10 z-0"
        animate={{ scale: [1, 0.8, 1.1, 1], rotate: [0, -30, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        {/* Left Text */}
        <motion.div
          className="max-w-xl text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Teach What You Know.
            <br />
            <span className="text-clay">Grow What You Love.</span>
          </h1>
          <p className="text-gray-700 text-lg md:text-xl mb-8">
            E-strateji empowers Haitian creators to share knowledge, earn, and inspire—online or offline.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/signup/creator">
              <Button size="lg" className="bg-clay text-white hover:bg-clay/90">
                Become a Creator
              </Button>
            </Link>
            <Link to="/signup/learner">
            <Button variant="outline" size="lg" className="border-clay text-clay">
                Explore Courses
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Animation */}
        <motion.div
          className="w-full md:w-[420px] h-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          <Lottie animationData={bgAnimation} loop autoplay />
        </motion.div>
      </div>
    </section>
  );
}
