import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { getUserById } from '@/services/auth';
import { getPublicCoursesByCreator } from '@/services/courses';
import { Avatar, AvatarFallback, AvatarImage } from '@/components2/ui/avatar';
import { Loader2, Share2, Users, BookOpen, Star, ArrowUpRight, Sparkles } from 'lucide-react';
import { placeholderCreatorData } from './ placeholderCreatorData';

// BentoTemplate.jsx
const bentoPalettes = {
  'color-1': { // Ocean Breeze
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    text1: '#FFFFFF',
    text2: 'rgba(255, 255, 255, 0.8)',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    buttonBg: 'rgba(255, 255, 255, 0.2)',
    buttonText: '#FFFFFF',
    gradientFrom: 'rgba(14, 165, 233, 0.95)',
    gradientTo: 'rgba(139, 92, 246, 0.90)',
    bentoBg1: 'rgba(14, 165, 233, 0.18)',
    bentoBg2: 'rgba(6, 182, 212, 0.18)',
    bentoBg3: 'rgba(139, 92, 246, 0.18)',
    shadow: '0 20px 40px rgba(14, 165, 233, 0.3)'
  },
  'color-2': { // Sunset Glow
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#EC4899',
    text1: '#FFFFFF',
    text2: 'rgba(255, 255, 255, 0.8)',
    background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    buttonBg: 'rgba(255, 255, 255, 0.2)',
    buttonText: '#FFFFFF',
    gradientFrom: 'rgba(245, 158, 11, 0.95)',
    gradientTo: 'rgba(236, 72, 153, 0.90)',
    bentoBg1: 'rgba(245, 158, 11, 0.18)',
    bentoBg2: 'rgba(239, 68, 68, 0.18)',
    bentoBg3: 'rgba(236, 72, 153, 0.18)',
    shadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
  }
};


export default function BentoTemplate({ paletteKey = 'color-1', banner, data = placeholderCreatorData }) {
  // const [creator, setCreator] = useState(null);
  // const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);

  const palette = bentoPalettes[paletteKey] || bentoPalettes['color-1'];
  const { creator, courses, highlights, links, stats } = data;

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [creatorData, courseList] = await Promise.all([
  //         getUserById(id),
  //         getPublicCoursesByCreator(id)
  //       ]);
  //       setCreator(creatorData);
  //       setCourses(courseList || []);
  //     } catch (err) {
  //       console.error("Error loading creator data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [id]);

  // if (loading || !creator) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center" style={{ background: palette.background }}>
  //       <Loader2 className="animate-spin w-8 h-8 text-white" />
  //     </div>
  //   );
  // }

  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0);

  return (
    <div className="min-h-screen text-white" style={{ background: palette.background }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Profile Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <Avatar className="w-32 h-32 rounded-2xl mx-auto border-4 border-white/40 shadow-lg">
                  <AvatarImage src={creator.profile_image_url} />
                  <AvatarFallback className="text-2xl">
                    {creator.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mt-6">
                  <h1 className="text-2xl font-bold">{creator.full_name}</h1>
                  <p className="text-white/80 mt-2 text-sm">
                    {creator.bio?.split('.')[0] || 'E-strateji Creator'}
                  </p>
                  <div className="flex justify-center mt-4">
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span className="text-xs text-yellow-300 ml-1">Verified Creator</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
              >
                <h2 className="text-4xl font-bold mb-4">
                  Welcome to My Learning Space
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  {creator.bio || 'Discover comprehensive learning experiences designed to help you succeed.'}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2"
                    style={{ background: palette.buttonBg, color: palette.buttonText }}
                  >
                    <BookOpen size={16} />
                    Explore Courses ({courses.length})
                  </motion.button>
                  <button className="px-6 py-3 rounded-xl font-semibold border-2 border-white/30 backdrop-blur-lg transition-all hover:bg-white/10 flex items-center gap-2">
                    <Share2 size={16} />
                    Share Profile
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Bento Grid Courses */}
      <section className="max-w-7xl mx-auto px-6 py-16 -mt-10 relative z-10">
        {courses.length > 0 ? (
          <>
            {/* Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20"
                style={{ background: palette.bentoBg1 }}
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm opacity-80">Courses</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20"
                style={{ background: palette.bentoBg2 }}
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalStudents}</div>
                <div className="text-sm opacity-80">Students</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20"
                style={{ background: palette.bentoBg3 }}
              >
                <Star className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm opacity-80">Rating</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20"
                style={{ background: palette.bentoBg1 }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-80">Satisfaction</div>
              </motion.div>
            </div>

            {/* Courses Bento Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className={`rounded-2xl p-6 backdrop-blur-lg border border-white/20 shadow-xl cursor-pointer group ${
                    index % 3 === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                  style={{
                    background: index % 3 === 0 ? palette.bentoBg1 : 
                              index % 3 === 1 ? palette.bentoBg2 : palette.bentoBg3,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg flex-1">{course.title}</h3>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm opacity-80 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-70">👥 {course.student_count || 0} students</span>
                    <span className="font-semibold">Enroll Now →</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="rounded-2xl p-8 max-w-md mx-auto backdrop-blur-lg border border-white/20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No Courses Available Yet</h3>
              <p className="opacity-70">Check back soon for new course offerings.</p>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export { bentoPalettes };