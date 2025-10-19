import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '@/services/auth';
import { getPublicCoursesByCreator } from '@/services/courses';
import { Avatar, AvatarFallback, AvatarImage } from '@/components2/ui/avatar';
import { Loader2, Share2, Mail, BookOpen, Users, Star, ArrowRight } from 'lucide-react';
import { placeholderCreatorData } from './ placeholderCreatorData';

// MinimalisticTemplate.jsx
const minimalPalettes = {
  'color-1': { // Light Professional
    primary: '#1E293B',
    secondary: '#475569',
    accent: '#3B82F6',
    background: '#FFFFFF',
    cardBg: '#F8FAFC',
    border: '#E2E8F0',
    text: '#1E293B',
    textSecondary: '#64748B',
    buttonBg: '#3B82F6',
    buttonText: '#FFFFFF',
    hoverBg: '#F1F5F9',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8'
  },
  'color-2': { // Warm Minimal
    primary: '#374151',
    secondary: '#6B7280',
    accent: '#059669',
    background: '#FFFFFF',
    cardBg: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    buttonBg: '#059669',
    buttonText: '#FFFFFF',
    hoverBg: '#F3F4F6',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    badgeBg: '#ECFDF5',
    badgeText: '#047857'
  },
  'color-dark': { // Dark Mode
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    accent: '#60A5FA',
    background: '#0F172A',
    cardBg: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    buttonBg: '#3B82F6',
    buttonText: '#FFFFFF',
    hoverBg: '#334155',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    badgeBg: '#1E40AF',
    badgeText: '#60A5FA'
  }
};



export default function MinimalisticTemplate({ paletteKey = 'color-1', banner, data = placeholderCreatorData }) {
  // const [creator, setCreator] = useState(null);
  // const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const palette = minimalPalettes[paletteKey] || minimalPalettes['color-2'];
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
  //     <div className="min-h-screen flex items-center justify-center bg-white">
  //       <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
  //     </div>
  //   );
  // }

  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0);

  return (
    <div className="min-h-screen bg-white" style={{ color: palette.text }}>
      {/* Simple Header */}
      <div className="border-b" style={{ borderColor: palette.border }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2" style={{ borderColor: palette.border }}>
                <AvatarImage src={creator.profile_image_url} />
                <AvatarFallback className="text-lg">
                  {creator.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: palette.primary }}>
                  {creator.full_name}
                </h1>
                <p className="text-sm" style={{ color: palette.textSecondary }}>
                  Educator & Mentor
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: palette.border, color: palette.textSecondary }}>
                <Share2 size={16} />
              </button>
              <button className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: palette.border, color: palette.textSecondary }}>
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Bio Section */}
        {creator.bio && (
          <div className="mb-12 text-center">
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: palette.textSecondary }}>
              {creator.bio}
            </p>
          </div>
        )}

        {/* Simple Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: palette.primary }}>
              {courses.length}
            </div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: palette.primary }}>
              {totalStudents}
            </div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: palette.primary }}>
              4.9
            </div>
            <div className="text-sm" style={{ color: palette.textSecondary }}>Rating</div>
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: palette.primary }}>
            Available Courses
          </h2>
          
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} 
                     className="p-6 rounded-lg border transition-all hover:shadow-sm cursor-pointer group"
                     style={{ 
                       background: palette.cardBg, 
                       borderColor: palette.border 
                     }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2" style={{ color: palette.primary }}>
                        {course.title}
                      </h3>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: palette.textSecondary }}>
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: palette.textSecondary }}>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {course.student_count || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} />
                          4.9 rating
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                               style={{ color: palette.accent }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border" 
                 style={{ background: palette.cardBg, borderColor: palette.border }}>
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: palette.primary }}>
                No Courses Available
              </h3>
              <p style={{ color: palette.textSecondary }}>
                Check back later for new course offerings
              </p>
            </div>
          )}
        </div>

        {/* Simple Footer */}
        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: palette.border }}>
          <p className="text-sm" style={{ color: palette.textSecondary }}>
            © 2024 {creator.full_name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export { minimalPalettes };