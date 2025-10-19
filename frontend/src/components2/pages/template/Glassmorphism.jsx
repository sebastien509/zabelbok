import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { getUserById } from '@/services/auth';
import { getPublicCoursesByCreator } from '@/services/courses';
import { Avatar, AvatarFallback, AvatarImage } from '@/components2/ui/avatar';
import { Loader2, Share2, Mail, Globe, BookOpen, Users, Star } from 'lucide-react';
import { placeholderCreatorData } from './ placeholderCreatorData';

// GlassmorphismTemplate.jsx
const glassPalettes = {
  'color-1': { // Arctic Frost
    primary: '#3B82F6',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    buttonBg: 'rgba(255, 255, 255, 0.15)',
    buttonText: '#FFFFFF',
    iconBg: 'rgba(255, 255, 255, 0.1)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    backdropBlur: 'blur(16px)'
  },
  'color-2': { // Emerald Mist
    primary: '#10B981',
    secondary: '#059669',
    accent: '#0D9488',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #0D9488 100%)',
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    buttonBg: 'rgba(255, 255, 255, 0.15)',
    buttonText: '#FFFFFF',
    iconBg: 'rgba(255, 255, 255, 0.1)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    backdropBlur: 'blur(16px)'
  }
};


export default function GlassmorphismTemplate({ paletteKey = 'color-2', banner, data = placeholderCreatorData }) {
  // const [creator, setCreator] = useState(null);
  // const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const { creator, courses, highlights, links, stats } = data;


  const palette = glassPalettes[paletteKey] || glassPalettes['color-1'];

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
    <div className="min-h-screen" style={{ background: palette.background }}>
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl mb-8"
            style={{ background: palette.glassBg }}
          >
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/30">
              <AvatarImage src={creator.profile_image_url} />
              <AvatarFallback className="text-xl">
                {creator.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>
              {creator.full_name}
            </h1>
            <p className="text-lg mb-4" style={{ color: palette.textSecondary }}>
              {creator.bio || 'Educator & Course Creator'}
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 rounded-lg backdrop-blur-lg border border-white/20 transition-all hover:bg-white/10 flex items-center gap-2"
                style={{ color: palette.text }}>
                <Share2 size={16} />
                Share
              </button>
              <button className="px-4 py-2 rounded-lg backdrop-blur-lg border border-white/20 transition-all hover:bg-white/10 flex items-center gap-2"
                style={{ color: palette.text }}>
                <Mail size={16} />
                Contact
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
               style={{ background: palette.glassBg }}>
            <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: palette.primary }} />
            <div className="text-2xl font-bold" style={{ color: palette.text }}>{courses.length}</div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Courses</div>
          </div>
          
          <div className="backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
               style={{ background: palette.glassBg }}>
            <Users className="w-8 h-8 mx-auto mb-2" style={{ color: palette.secondary }} />
            <div className="text-2xl font-bold" style={{ color: palette.text }}>{totalStudents}</div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Students</div>
          </div>
          
          <div className="backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
               style={{ background: palette.glassBg }}>
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: palette.accent }} />
            <div className="text-2xl font-bold" style={{ color: palette.text }}>4.9/5</div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Rating</div>
          </div>
          
          <div className="backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
               style={{ background: palette.glassBg }}>
            <Globe className="w-8 h-8 mx-auto mb-2" style={{ color: palette.primary }} />
            <div className="text-2xl font-bold" style={{ color: palette.text }}>Online</div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Status</div>
          </div>
        </motion.div>

        {/* Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: palette.text }}>
            My Courses
          </h2>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="backdrop-blur-lg rounded-xl p-6 border border-white/20 cursor-pointer group"
                  style={{ background: palette.glassBg }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                         style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full border border-white/20"
                         style={{ color: palette.textSecondary }}>
                      {course.student_count || 0} students
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2" style={{ color: palette.text }}>
                    {course.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: palette.textSecondary }}>
                    {course.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold" style={{ color: palette.primary }}>
                      Enroll Now
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs" style={{ color: palette.textSecondary }}>4.9</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 backdrop-blur-lg rounded-xl border border-white/20"
                 style={{ background: palette.glassBg }}>
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: palette.text }}>
                No Courses Available
              </h3>
              <p style={{ color: palette.textSecondary }}>
                New courses coming soon!
              </p>
            </div>
          )}
        </motion.div>

        {/* Bio Section */}
        {creator.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 backdrop-blur-lg rounded-xl p-8 border border-white/20"
            style={{ background: palette.glassBg }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: palette.text }}>
              About Me
            </h3>
            <p className="leading-relaxed" style={{ color: palette.textSecondary }}>
              {creator.bio}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export { glassPalettes };