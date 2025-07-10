import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components2/ui/dialog';
import { getModulesByCourse, deleteModuleById } from '@/services/modules';
import UploadContentModal from '@/creator/UploadContent';
import EditModuleModal from './EditModuleModal';
import { Button } from '@/components2/ui/button';
import { getCourseById } from '@/services/courses';
import { getCloudinaryThumbnail } from '@/utils/media';
import CreateCourseModal from './CreateCourseModal';

export default function ManageCourseModal({ course, open, onClose }) {
  const [modules, setModules] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(course);
  const [thumbnailErrorMap, setThumbnailErrorMap] = useState({});

  const getDraftKey = (courseId) => `module-draft-${courseId}`;

  useEffect(() => {
    if (currentCourse?.id && open) {
      fetchModules();
    }
  }, [currentCourse, open]);

  const fetchModules = async () => {
    const res = await getModulesByCourse(course.id);
    setModules(res || []);
  };

  const handleDelete = async (moduleId) => {
    if (moduleId !== modules[modules.length - 1]?.id) {
      return alert('Only the last module can be deleted to maintain structure.');
    }
    try {
      await deleteModuleById(moduleId);
      fetchModules();
    } catch (err) {
      alert('Failed to delete module');
    }
  };

  const handleCourseUpdated = async () => {
    const updated = await getCourseById(course.id);
    setCurrentCourse(updated);
    await fetchModules();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
  className="w-[95vw] max-w-[600px] max-h-[90vh] h-[85svh] overflow-y-auto sm:w-full md:max-w-4xl p-4 sm:p-6"
>
  <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
    <DialogTitle className="text-xl sm:text-2xl font-bold">
      📘 Manage Course: {currentCourse.title}
    </DialogTitle>
    <DialogDescription className="text-sm sm:text-base">
      <div>
        {currentCourse.description}
        <br />
        <button
          onClick={() => setShowEditModal(true)}
          className="text-blue-500 hover:underline mt-1 text-xs sm:text-sm"
        >
          ✏️ Edit Course Info
        </button>
      </div>
    </DialogDescription>
  </DialogHeader>

  {/* Draft Resume Prompt */}
  {localStorage.getItem(getDraftKey(currentCourse.id)) && (
    <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-3 py-2 rounded-md text-sm mb-4">
      📝 You have an unfinished draft module.
      <button
        onClick={() => setShowUpload(true)}
        className="underline text-blue-600 ml-2 hover:text-blue-800"
      >
        Resume Now
      </button>
    </div>
  )}

  {/* Modules List */}
  <div className="space-y-3 mt-2 sm:space-y-4 sm:mt-4 overflow-y-auto">
    {modules.map((mod, idx) => (
      <div
        key={mod.id}
        className="border rounded-lg p-3 sm:p-4 shadow flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        <div className="w-full sm:w-32 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          {!thumbnailErrorMap[mod.id] ? (
            <img
              src={getCloudinaryThumbnail(mod.video_url)}
              alt={`Thumbnail for ${mod.title}`}
              className="w-full h-full object-cover"
              onError={() =>
                setThumbnailErrorMap((prev) => ({ ...prev, [mod.id]: true }))
              }
            />
          ) : (
            <video
              src={mod.video_url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                e.target.currentTime = 1;
                e.target.pause();
              }}
            />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm sm:text-base">{mod.title}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{mod.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Duration: {mod.duration || 5} min
          </p>
        </div>

        <div className="flex gap-2 mt-3 sm:mt-0 sm:flex-col justify-end">
          <Button
            size="sm"
            variant="outline"
            className="w-24 sm:w-auto"
            onClick={() => setEditModule(mod)}
          >
            ✏️ Edit
          </Button>
          {idx === modules.length - 1 && (
            <Button
              size="sm"
              variant="destructive"
              className="w-24 sm:w-48 text-white bg-red-500"
              onClick={() => handleDelete(mod.id)}
            >
              🗑️ Delete
            </Button>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Upload Button Card */}
  <div
    onClick={() => setShowUpload(true)}
    className="mt-6 border border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:bg-coconut cursor-pointer transition"
  >
    <span className="text-2xl sm:text-3xl mb-2">➕</span>
    <p className="text-sm font-medium text-gray-700 text-center">
      Upload New Module
    </p>
  </div>

        {showUpload && currentCourse?.id && (
 <UploadContentModal
 open={showUpload}
 courseId={currentCourse.id}
 onClose={() => {
   setShowUpload(false);
   fetchModules();
 }}
 draft={localStorage.getItem(getDraftKey(currentCourse.id))}
 onDraftSave={(data) =>
   localStorage.setItem(getDraftKey(currentCourse.id), JSON.stringify(data))
 }
 onDraftClear={() => localStorage.removeItem(getDraftKey(currentCourse.id))}
/>
)}

        {/* Edit Course Modal */}
        {showEditModal && (
          <CreateCourseModal
            courseId={currentCourse.id}
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            openManage={() => {
              setShowEditModal(false);
              handleCourseUpdated();
            }}
          />
        )}

        {/* Edit Module Modal */}
        {editModule && (
          <EditModuleModal
            module={editModule}
            onClose={() => {
              setEditModule(null);
              fetchModules();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
