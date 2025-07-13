import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '@/services/auth';
import { getAllCourses } from '@/services/courses';
import CourseCard from '../CourseCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components2/ui/avatar';
import { Separator } from '@/components2/ui/separator';
import { Loader2, Palette, Settings, Share2, ArrowUp, Menu, X } from 'lucide-react';
import CreatorCustomizeModal from '../CreatorCustomizeModal';
import { useAuth } from '@/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const placeholderImage = "https://res.cloudinary.com/dyeomcmin/image/upload/v1740777512/avatar-3814081_1280_uot7fi.png";

const themes = {
  'theme-1': {
    primary: '#212529',
    secondary: '#1f2937',
    neutral: '#0b9b8a',
    opps: '#d4f1f4',
    text1: '#189ab4',
    text2: '#ffffff',
    bg: 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900',
  },
  'theme-2': {
    primary: '#ffffff',
    secondary: '#ffffff',
    neutral: '#d0725e',
    opps: '#198A5B',
    text1: '#222222',
    text2: '#000000',
    bg: 'bg-gradient-to-br from-yellow-200 via-white to-pink-100',
  },
  'theme-3': {
    primary: '#0f172a',
    secondary: '#1e293b',
    neutral: '#3b82f6',
    opps: '#64748b',
    text1: '#ffffff',
    text2: '#f8fafc',
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950',
  },
};


function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  
    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return windowSize;
  }
  
  // Custom useIntersectionObserver hook
  function useIntersectionObserver(ref, callback, options) {
    useEffect(() => {
      const observer = new IntersectionObserver(callback, options);
      const currentRef = ref.current;
  
      if (currentRef) {
        observer.observe(currentRef);
      }
  
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [ref, callback, options]);
  }

export default function CreatorPage({ theme: initialTheme = 'theme-1', banner: initialBanner = 'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688063/2_rrz9su.png' }) {
  const [userTheme, setUserTheme] = useState(initialTheme);
  const [userBanner, setUserBanner] = useState(initialBanner);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { id } = useParams();
  const { user } = useAuth() || {};
  const isOwner = user?.id === parseInt(id);
  
  const currentTheme = themes[userTheme] || themes['theme-1'];
  const [creator, setCreator] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const headerRef = useRef(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  // Intersection observer for header effects
  useIntersectionObserver(headerRef, ([entry]) => {
    setIsScrolled(!entry.isIntersecting);
  }, { threshold: 0.1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, all] = await Promise.all([
          getUserById(id),
          getAllCourses()
        ]);
        
        if (!Array.isArray(all)) throw new Error('Courses response is not an array');
        const filtered = all.filter(
          (c) => c.professor_id === parseInt(id) && c.school_id === 1
        );

        setCreator(user);
        setCourses(filtered);
        setUserTheme(user.theme || 'theme-1');
        setUserBanner(user.banner_url || '');
      } catch (err) {
        console.error('Failed to load creator data:', err);
        toast.error('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${creator?.full_name}'s Creator Profile`,
        text: `Check out ${creator?.full_name}'s courses on E-strateji!`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const debouncedScroll = debounce(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 100);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, []);

  if (loading || !creator) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary-500" />
      </div>
    );
  }

  const fallbackBanner = 'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688147/2_ciw0y5.png';
  const totalLearners = courses.reduce((acc, c) => acc + (c.student_count || 0), 0);

  return (
    <div className={`w-full min-h-screen text-${currentTheme.text1} bg-${currentTheme.primary}`}>
      {/* Sticky Header */}
      <motion.header
        ref={headerRef}
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isScrolled ? 0.95 : 1,
          y: isScrolled ? -10 : 0,
          height: isScrolled ? 70 : 'auto'
        }}
        transition={{ duration: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-${currentTheme.primary}/90 shadow-sm transition-all ${isScrolled ? 'py-2' : 'py-4'}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div 
            animate={{ scale: isScrolled ? 0.8 : 1 }}
            className="flex items-center gap-2"
          >

            <Avatar className={`${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} transition-all`}>
              <AvatarImage
                src={creator.profile_image_url || placeholderImage}
                alt={creator.full_name || 'User'}
              />
              <AvatarFallback>{creator.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>

            {isScrolled && (
              <h2 className="text-sm font-semibold whitespace-nowrap">
                {creator.full_name}
              </h2>
            )}
          </motion.div>
          
          {isMobile ? (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-200/20"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="flex items-center gap-1 text-sm hover:text-${currentTheme.neutral}"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              {isOwner && (
                <button
                  onClick={() => setShowCustomizeModal(true)}
                  className="flex items-center gap-1 text-sm hover:text-${currentTheme.neutral}"
                >
                  <Palette size={16} />
                  <span>Customize</span>
                </button>
              )}
            </div>
          )}
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-4 z-50 bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-4 w-48"
          >
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-sm"
              >
                <Share2 size={16} />
                Share Profile
              </button>
              {isOwner && (
                <button
                  onClick={() => {
                    setShowCustomizeModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Palette size={16} />
                  Customize
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <div className="pt-16">
        <div
          className={`w-full h-48 md:h-64 lg:h-80 relative ${currentTheme.bg} shadow-md`}
          style={{
            backgroundImage: `url(${userBanner || fallbackBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute -bottom-12 left-6 md:left-10">
            <Avatar className="w-24 h-24 md:w-56 md:h-56 ring-4 ring-white shadow-xl">
              <AvatarImage src={creator.profile_image_url} />
              <AvatarFallback>{creator.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Creator Info */}
      <div className="pt-16 px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{creator.full_name}</h1>
            <p className="text-sm md:text-base text-gray-500">🎓 E-strateji Creator</p>
          </div>
          {!isMobile && (
            <div className="flex gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              {isOwner && (
                <button
                  onClick={() => setShowCustomizeModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  <Palette size={16} />
                  <span>Customize</span>
                </button>
              )}
            </div>
          )}
        </div>

        {creator.bio && (
          <p className="mt-4 text-sm md:text-base text-gray-700 max-w-3xl line-clamp-3 whitespace-pre-wrap">
            {creator.bio}
          </p>
        )}

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Courses</p>
            <p className="text-xl font-semibold">{courses.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Learners</p>
            <p className="text-xl font-semibold">{totalLearners}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Rating</p>
            <p className="text-xl font-semibold">4.8 ★</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Joined</p>
            <p className="text-xl font-semibold">2025</p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Tabs */}
      <div className="px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="flex gap-6 border-b text-sm text-gray-500 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'courses' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'hover:text-indigo-500'}`}
          >
            Courses
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'about' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'hover:text-indigo-500'}`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'hover:text-indigo-500'}`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 sm:px-10 md:px-12 lg:px-16 py-8">
        {activeTab === 'courses' && (
          <>
            <h2 className="text-xl md:text-2xl font-semibold mb-6">📚 Courses by {creator.full_name}</h2>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No courses published yet.</p>
                {isOwner && (
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Create Your First Course
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    enrolled={false} 
                    theme={currentTheme}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">About {creator.full_name}</h2>
            <div className="prose prose-sm md:prose">
              {creator.bio ? (
                <p className="whitespace-pre-wrap">{creator.bio}</p>
              ) : (
                <p className="text-gray-500">No bio information available.</p>
              )}
              
              <h3 className="mt-8 text-lg font-medium">Teaching Philosophy</h3>
              <p className="text-gray-700 mt-2">
                {creator.teaching_philosophy || 'No teaching philosophy provided.'}
              </p>
              
              <h3 className="mt-8 text-lg font-medium">Education</h3>
              <p className="text-gray-700 mt-2">
                {creator.education || 'No education information provided.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-6">🌟 Reviews</h2>
            <div className="grid gap-6">
              {[1, 2, 3].map((review) => (
                <div key={review} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://i.pravatar.cc/150?img=${review}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">User {review}</p>
                      <div className="flex gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">2 months ago</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {isScrolled && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handleScrollToTop}
              className="p-3 rounded-full backdrop-blur-md bg-white/80 border border-gray-200 shadow-lg hover:bg-white transition-all"
            >
              <ArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomizeModal(true)}
            className="p-3 rounded-full backdrop-blur-md bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all"
          >
            <Palette size={20} />
          </motion.button>
        )}
      </div>

      <CreatorCustomizeModal
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        onConfirm={({ theme, banner }) => {
          setUserTheme(theme);
          setUserBanner(banner);
          toast.success('Profile style updated successfully!');
        }}
        currentTheme={userTheme}
        currentBanner={userBanner}
      />
    </div>
  );
}