import React, { useEffect, useState } from 'react';
import { getUserCourses, getMe } from '@/services/auth';
import { useAuth } from '@/AuthContext';
import CreatorSidebar from '../CreatorSidebar';
import CreatorCustomizeModal from '../CreatorCustomizeModal';
import CreatorCourseCard from '../CreatorCourseCard';
import { Button } from '@/components2/ui/button';
import { Loader2, BookOpen, PlusCircle, LogOut, Settings, Upload, Home, User, BarChart2, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components2/ui/use-toast';

export default function CreatorDashboard() {
  const { user, logout } = useAuth() || {};
  const [courses, setCourses] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsCustomization, setNeedsCustomization] = useState(false);
  const [style, setStyle] = useState({ theme: null, banner: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [userData, courseData] = await Promise.all([
          getMe(),
          getUserCourses()
        ]);
        
        // const hasStyle = userData.theme && userData.banner_url;
        setCreator(userData);
        setCourses(courseData || []);
        // setStyle({ theme: userData.theme, banner: userData.banner_url });
        // setNeedsCustomization(!hasStyle);
      } catch (err) {
        console.error('Failed to load user or courses:', err);
        if (err?.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [refreshKey]);

  const handleCustomizationComplete = ({ theme, banner }) => {
    setStyle({ theme, banner });
    setNeedsCustomization(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C365E] mx-auto mb-2" />
          <p className="text-[#222222] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalStudents = courses.reduce((acc, c) => acc + (c.student_count || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] text-[#222222] relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/80 backdrop-blur-md border border-[#EA7125]/20 shadow-sm"
      >
        <Menu className="h-5 w-5 text-[#EA7125]" />
      </button>

      {/* Sidebar */}
      <div className="hidden md:block">
        <CreatorSidebar
          onCustomize={() => setNeedsCustomization(true)}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          courses={courses}
          onLogout={logout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl md:hidden"
            >
              <CreatorSidebar
                onCustomize={() => {
                  setNeedsCustomization(true);
                  setMobileSidebarOpen(false);
                }}
                onRefresh={() => setRefreshKey(prev => prev + 1)}
                activeModal={activeModal}
                setActiveModal={(modal) => {
                  setActiveModal(modal);
                  setMobileSidebarOpen(false);
                }}
                courses={courses}
                onLogout={logout}
                mobileClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 lg:p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">🎥 Welcome, {creator?.full_name}</h1>
            <p className="text-sm text-[#2C365E] mt-1">Creator Dashboard Overview</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setNeedsCustomization(true)}
              className="flex-1 md:flex-none bg-white/80 backdrop-blur-md border-[#EA7125]/20 hover:bg-[#EA7125]/10 hover:border-[#EA7125]/30"
            >
              Edit Page Style
            </Button>  
            <Button 
              variant="default" 
              asChild
              className="flex-1 md:flex-none bg-[#EA7125] hover:bg-[#EA7125]/90"
            >
              <a href={`/creator/${creator?.id}`} target="_blank" rel="noopener noreferrer">
                View My Page
              </a>
            </Button>
          </div>
        </div>

        {/* Bento Grid Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Courses Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#EA7125]/20 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#EA7125]/10">
                <BookOpen className="h-5 w-5 text-[#EA7125]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C365E]">Courses</h3>
            </div>
            <p className="text-3xl font-bold mb-1 text-[#222222]">{courses.length}</p>
            <p className="text-xs text-[#2C365E]/80">Published Modules</p>
          </motion.div>

          {/* Students Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#66A569]/20 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#66A569]/10">
                <User className="h-5 w-5 text-[#66A569]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C365E]">Students</h3>
            </div>
            <p className="text-3xl font-bold mb-1 text-[#222222]">{totalStudents}</p>
            <p className="text-xs text-[#2C365E]/80">Total Learners</p>
          </motion.div>

          {/* Engagement Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#2C365E]/20 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#2C365E]/10">
                <BarChart2 className="h-5 w-5 text-[#2C365E]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C365E]">Engagement</h3>
            </div>
            <p className="text-3xl font-bold mb-1 text-[#222222]">92%</p>
            <p className="text-xs text-[#2C365E]/80">Completion Rate</p>
          </motion.div>
        </div>

        {/* My Courses Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#2C365E]/10 p-2 rounded-lg text-[#2C365E]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">My Courses</h1>
                <p className="text-xs text-[#2C365E]/80">Manage your learning content</p>
              </div>
            </div>
            <Button 
              className="gap-2 bg-[#EA7125] hover:bg-[#EA7125]/90 text-sm"
              onClick={() => setActiveModal('new-course')}
            >
              <PlusCircle className="h-4 w-4" />
              New Course
            </Button>
          </div>

          {courses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0.5, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/50 rounded-lg p-6 text-center border border-dashed border-[#EA7125]/30"
            >
              <BookOpen className="h-8 w-8 mx-auto text-[#2C365E]/30 mb-3" />
              <h3 className="text-base font-medium text-[#2C365E]">No courses yet</h3>
              <p className="text-xs text-[#2C365E]/60 mt-1 mb-4">
                You haven't created any courses yet
              </p>
              <Button 
                className="gap-2 bg-[#EA7125] hover:bg-[#EA7125]/90 text-sm"
                onClick={() => setActiveModal('new-course')}
              >
                <PlusCircle className="h-4 w-4" />
                Create your first course
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course) => (
                <CreatorCourseCard
                  key={course.id} 
                  course={course} 
                  setActiveModal={setActiveModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {needsCustomization && (
        <CreatorCustomizeModal
          open={needsCustomization}
          onClose={(openState) => setNeedsCustomization(openState)}
          onConfirm={handleCustomizationComplete}
        />
      )}
    </div>
  );
}