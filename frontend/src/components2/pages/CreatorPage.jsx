import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserById } from '@/services/auth';
import { getPublicCoursesByCreator } from '@/services/courses';
import CourseCard from '../CourseCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components2/ui/avatar';
import { Separator } from '@/components2/ui/separator';
import { Loader2, Palette, Share2, ArrowUp } from 'lucide-react';
import CreatorCustomizeModal from '../CreatorCustomizeModal';
import { useAuth } from '@/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const placeholderImage = "https://res.cloudinary.com/dyeomcmin/image/upload/v1740777512/avatar-3814081_1280_uot7fi.png";

const themes = {
  "theme-1": {
    name: "Tech & Clean",
    bg: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#38bdf8',
    opps: '#f0f9ff',
    text1: '#e2e8f0',
    text2: '#1e293b',
    button: '#0ea5e9',
    className: {
      headshot: "rounded-full ring-4 ring-white shadow-md",
      banner: "backdrop-blur-md bg-opacity-60 border-b border-gray-500",
      cards: "glass grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
      body: "glass p-6 rounded-xl shadow-xl"
    }
  },
  "theme-2": {
    name: "Bright & Uplifting",
    bg: 'linear-gradient(to bottom right, #fff1eb, #ace0f9)',
    primary: '#ffffff',
    secondary: '#f9fafb',
    accent: '#f59e0b',
    opps: '#fff7ed',
    text1: '#111827',
    text2: '#374151',
    button: '#f59e0b',
    className: {
      headshot: "ring-2 ring-yellow-300",
      banner: "bento border border-yellow-300",
      cards: "bento gap-4",
      body: "bg-white border border-gray-200 shadow-md rounded-lg"
    }
  },
  "theme-3": {
    name: "Elegant & Dark",
    bg: 'linear-gradient(to bottom right, #1c1c1c, #2c2c2c)',
    primary: '#1c1c1c',
    secondary: '#2c2c2c',
    accent: '#8b5cf6',
    opps: '#312e81',
    text1: '#f3f4f6',
    text2: '#d1d5db',
    button: '#a78bfa',
    className: {
      headshot: "ring-2 ring-purple-500",
      banner: "border-b border-purple-900 shadow-md",
      cards: "bordered grid-cols-1 sm:grid-cols-2 gap-4",
      body: "border border-gray-700 rounded-md bg-opacity-90"
    }
  }
};

export default function CreatorPage({ theme: initialTheme = 'theme-1', banner: initialBanner }) {
  const [userTheme, setUserTheme] = useState(initialTheme);
  const [userBanner, setUserBanner] = useState(initialBanner);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [creator, setCreator] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const isOwner = user?.id === parseInt(id);
  const currentTheme = themes[userTheme] || themes["theme-1"];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorData, courseList] = await Promise.all([
          getUserById(id),
          getPublicCoursesByCreator(id)
        ]);
        setCreator(creatorData);
        setCourses(courseList || []);
        setUserTheme(creatorData.theme || 'theme-1');
        setUserBanner(creatorData.banner_url);
      } catch (err) {
        toast.error("Error loading creator data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleScroll = debounce(() => {
    setIsScrolled(window.scrollY > 60);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (loading || !creator) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div 
      style={{ backgroundColor: currentTheme.primary, color: currentTheme.text1 }} 
      className={currentTheme.className.body}
    >
      {/* Banner */}
      <div
        className={`h-64 bg-cover bg-center relative ${currentTheme.className.banner}`}
        style={{
          backgroundImage: `url(${userBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: `4px solid ${currentTheme.accent}`
        }}
      >
        <div className="absolute bottom-4 left-6 flex items-center gap-4">
          <Avatar className={`w-24 h-24 border-4 ${currentTheme.className.headshot}`}>
            <AvatarImage src={creator.profile_image_url || placeholderImage} />
            <AvatarFallback>{creator.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.text1 }}>{creator.full_name}</h1>
            <p className="text-sm">E-strateji Creator</p>
          </div>
        </div>
      </div>

      {/* Customize & Share */}
      <div className="flex justify-between items-center px-6 pt-6">
        <div>
          {creator.bio && (
            <p className="text-sm opacity-80 max-w-xl" style={{ color: currentTheme.text1 }}>{creator.bio}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              style={{ backgroundColor: currentTheme.button, color: '#fff' }}
              className="px-4 py-1 rounded-md text-sm"
            >
              <Share2 size={16} className="inline mr-1" /> Share
            </button>
            <button
              onClick={() => setShowCustomizeModal(true)}
              style={{ backgroundColor: currentTheme.button, color: '#fff' }}
              className="px-4 py-1 rounded-md text-sm"
            >
              <Palette size={16} className="inline mr-1" /> Customize
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 mt-6">
        <div style={{ backgroundColor: currentTheme.opps, color: currentTheme.text2 }} className="p-4 rounded-lg shadow-sm">
          <p className="text-xs">Courses</p>
          <p className="text-lg font-bold">{courses.length}</p>
        </div>
        <div style={{ backgroundColor: currentTheme.opps, color: currentTheme.text2 }} className="p-4 rounded-lg shadow-sm">
          <p className="text-xs">Learners</p>
          <p className="text-lg font-bold">
            {courses.reduce((acc, c) => acc + (c.student_count || 0), 0)}
          </p>
        </div>
        <div style={{ backgroundColor: currentTheme.opps, color: currentTheme.text2 }} className="p-4 rounded-lg shadow-sm">
          <p className="text-xs">Rating</p>
          <p className="text-lg font-bold">4.8★</p>
        </div>
        <div style={{ backgroundColor: currentTheme.opps, color: currentTheme.text2 }} className="p-4 rounded-lg shadow-sm">
          <p className="text-xs">Joined</p>
          <p className="text-lg font-bold">2025</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Course Section */}
      <div className="px-6 pb-12">
        <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.text1 }}>
          📘 Courses by {creator.full_name}
        </h2>
        {courses.length === 0 ? (
          <p className="text-gray-400">No courses yet.</p>
        ) : (
          <div className={currentTheme.className.cards}>
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
              >
                <CourseCard course={course} theme={currentTheme} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB Scroll Button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-white border shadow rounded-full p-3 z-50"
            style={{ backgroundColor: currentTheme.button, color: '#fff' }}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <CreatorCustomizeModal
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        onConfirm={({ theme, banner }) => {
          setUserTheme(theme);
          setUserBanner(banner);
          toast.success("Profile style updated!");
        }}
        currentTheme={userTheme}
        currentBanner={userBanner}
      />
    </div>
  );
}