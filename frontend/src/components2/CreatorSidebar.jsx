import React from 'react';
import { Home, BookOpen, Upload, Settings, LogOut, PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';


import ProfileSettingsModal from './ProfileSettingsModal';
import UploadContent from '@/creator/UploadContent';
import CreateCourseModal from '@/components2/CreateCourseModal';
import ManageCourseModal from './ManageCourseModal';

const navItems = [
  { label: 'Dashboard', icon: <Home className="h-4 w-4" />, action: 'dashboard' },
  { label: 'Upload Content', icon: <Upload className="h-4 w-4" />, action: 'upload' },
  { label: 'Profile Settings', icon: <Settings className="h-4 w-4" />, action: 'profile-settings' }
];

export default function CreatorSidebar({ 
  onCustomize, 
  onRefresh, 
  activeModal, 
  setActiveModal, 
  courses, 
  onLogout,
  mobileClose
}) {
  const handleNavClick = (item) => {
    setActiveModal(item.action);
  };

  return (
    <div className="h-full glass flex flex-col p-4 bg-white border-r border-[#EA7125]/10">
      {/* Mobile Close Button */}
      {mobileClose && (
        <button 
          onClick={mobileClose}
          className="md:hidden absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-[#EA7125]" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 p-3 mb-6">
        <div className="bg-[#EA7125]/10 p-2 rounded-lg">
          <BookOpen className="h-5 w-5 text-[#EA7125]" />
        </div>
        <h2 className="text-xl font-bold text-[#2C365E]">Creator Hub</h2>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              handleNavClick(item);
              mobileClose?.();
            }}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeModal === item.action 
                ? 'bg-[#EA7125]/10 text-[#EA7125]' 
                : 'hover:bg-[#2C365E]/5 text-[#2C365E]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </motion.button>
        ))}

        {/* Courses Section */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-[#2C365E]/70 uppercase tracking-wider px-4 mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            My Courses
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
            {courses?.length === 0 ? (
              <p className="text-xs text-[#2C365E]/50 px-4 py-2">No courses yet</p>
            ) : (
              courses?.map((course) => (
                <motion.button
                  key={course.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveModal(`manage-${course.id}`);
                    mobileClose?.();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm truncate ${
                    activeModal === `manage-${course.id}`
                      ? 'bg-[#EA7125]/10 text-[#EA7125] font-medium'
                      : 'hover:bg-[#2C365E]/5 text-[#2C365E]'
                  }`}
                >
                  {course.title}
                </motion.button>
              ))
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveModal('new-course');
              mobileClose?.();
            }}
            className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-sm font-medium text-[#EA7125] hover:bg-[#EA7125]/10 rounded-lg"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Course</span>
          </motion.button>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-[#EA7125]/10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onCustomize();
            mobileClose?.();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-[#2C365E] hover:bg-[#2C365E]/5 rounded-lg mb-2"
        >
          <Settings className="h-4 w-4" />
          <span>Customize Profile</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.clear();
            toast.success('Logged out successfully');
            window.location.href = '/login';

          }}
          
          className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg"
        >

          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </motion.button>
      </div>
      {/* Modals */}
      <UploadContent
        open={activeModal === 'upload'}
        onClose={() => setActiveModal(null)}
        onUploaded={() =>
          toast('Module uploaded', {
            description: 'Your video module was successfully uploaded.',
          })
        }
      />

      <ProfileSettingsModal
        open={activeModal === 'profile-settings'}
        onClose={() => setActiveModal(null)}
        onUpdated={() => {
          toast('Profile updated', { description: 'Your changes have been saved.' });
          onRefresh();
        }}
      />

      <CreateCourseModal
        open={activeModal === 'new-course'}
        onClose={() => {
          setActiveModal(null);
          onRefresh();
        }}
        onCreated={(id) => {
          toast('Course created', { description: 'New course is now active!' });
          setActiveModal(`manage-${id}`);
          onRefresh();
        }}
      />

      {courses.map((course) => (
        <ManageCourseModal
          key={course.id}
          course={course}
          open={activeModal === `manage-${course.id}`}
          onClose={() => {
            setActiveModal(null);
            onRefresh();
          }}
          onUpdated={() => {
            toast('Course updated', { description: `Changes to "${course.title}" saved.` });
            onRefresh();
          }}
          onDeleted={() => {
            toast('Course deleted', { description: `"${course.title}" has been removed.` });
            setActiveModal(null);
            onRefresh();
          }}
        />
      ))}
    </div>
  );
}