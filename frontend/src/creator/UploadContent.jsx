import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCourseById } from '@/services/courses';
import { getModulesByCourse, createModule, publishReviewedModule } from '@/services/modules';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components2/ui/button';
import UploadModuleLoading from '@/components2/ui/UploadModuleLoading';
import { CheckCircle, Circle, Loader2, FileText, ClipboardList, UploadCloud } from 'lucide-react';
import { compressVideo } from '@/utils/compressVideo';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';


export function checkVideoDuration(file, maxSeconds = 600) { // 10 minutes = 600s
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      if (duration > maxSeconds) {
        reject(new Error(`Video is too long. Max allowed is ${maxSeconds / 60} minutes.`));
      } else {
        resolve(duration);
      }
    };

    video.onerror = () => {
      reject(new Error("Unable to load video metadata."));
    };

    video.src = URL.createObjectURL(file);
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
}

export default function UploadContentModal({ courseId, open, onClose, draft, onDraftSave, onDraftClear }) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [currentStep, setCurrentStep] = useState('uploading');

  // Load course data
  useEffect(() => {
    if (!courseId || !open) return;

    const loadData = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourseById(courseId),
          getModulesByCourse(courseId)
        ]);
        setCourse(courseRes);
        setModules(modulesRes);
      } catch (error) {
        console.error("Failed to load course data:", error);
        toast({ title: 'Error', description: 'Failed to load course data' });
      }
    };

    loadData();
  }, [courseId, open]);

  // Load draft if exists
  useEffect(() => {
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        toast({ title: 'Draft loaded', description: 'Resume your module creation' });
      } catch {
        console.warn("Failed to parse draft data");
      }
    }
  }, [draft]);

  const saveDraft = () => {
    onDraftSave?.({ title, description });
    toast({ title: 'Draft saved', description: 'You can return to it later' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!videoFile) {
      toast({ title: 'Missing video', description: 'Please select a video file' });
      return;
    }

    try {
      await checkVideoDuration(videoFile, 600); // 600s = 10min
    } catch (err) {
      toast({ title: 'Video too long', description: err.message });
      return;
    }
  
  
    if (videoFile.size > 300 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 300MB' });
      return;
    }
  
    const renamedFile = new File([videoFile], `${slugify(title)}.mp4`, {
      type: videoFile.type,
    });
  
    const moduleData = {
      title,
      description,
      course_id: courseId,
      order: modules.length + 1,
      created_at: new Date().toISOString(),
    };
  
    try {
      setIsUploading(true);
      setCurrentStep('uploading');
  
      // 1. Upload to Cloudinary (no compression needed here)
      // ✅ NEW: Compress before upload
      const compressedFile = await compressVideo(renamedFile);
      const videoUrl = await uploadToCloudinary(compressedFile);
        
      // 2. Send to backend for processing
      setCurrentStep('transcribing');
      const res = await createModule({
        ...moduleData,
        video_url: videoUrl,
      });
  
      // 3. Show review block
      setReviewData({
        module: { ...moduleData, video_url: videoUrl },
        transcript: res.transcript,
        quiz: res.quiz_questions,
      });
  
      setCurrentStep('complete');
      await new Promise(resolve => setTimeout(resolve, 1000));
  
    } catch (err) {
      toast({ title: "Upload failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };
  

  const handlePublish = async () => {
    if (!reviewData) return;
    
    try {
      setIsUploading(true);
      setCurrentStep('publishing');
      
      await publishReviewedModule({
        ...reviewData.module,
        transcript: reviewData.transcript,
        quiz: reviewData.quiz,
      });
      
      onDraftClear?.();
      toast({ title: 'Success', description: 'Module published successfully' });
      onClose();
    } catch (error) {
      console.error("Publish failed:", error);
      toast({ 
        title: 'Publish failed', 
        description: error.message || 'Check your connection and try again' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const lastModule = modules[modules.length - 1];

  return (
    <>
      {/* Loading overlay */}
      {isUploading &&
  typeof window !== 'undefined' &&
  createPortal(
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
  >
    <UploadModuleLoading currentStep={currentStep} />
  </motion.div>,
    document.body
  )}


      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <DialogDescription/>
              Upload Module to <span className="text-blue-600">{course?.title}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Course info */}
          <div className="mb-6 space-y-1 text-sm text-gray-600">
            <p>📚 <strong>{modules.length}</strong> modules in this course</p>
            {lastModule && (
              <p>⏱️ Last module: <span className="font-medium">{lastModule.title}</span> ({lastModule.duration || 'N/A'} min)</p>
            )}
          </div>

          {!reviewData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Module Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Introduction to Course"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="What will students learn in this module?"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Video File</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {videoFile ? videoFile.name : 'MP4, MOV or AVI (MAX. 300MB)'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => setVideoFile(e.target.files[0])} 
                      className="hidden" 
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isUploading}
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !videoFile}
                >
                  {isUploading ? 'Processing...' : 'Upload Module'}
                </Button>
              </div>
            </form>
          ) : (
<div className="flex flex-col w-full max-w-[95vw] lg:max-w-5xl h-[90vh] lg:h-[90vh] bg-gray-50 sm:bg-white rounded-lg overflow-hidden">
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto p-4 space-y-6">
    {/* Transcript Section */}
    <div>
      <h3 className="text-lg font-medium mb-2">📝 Transcript</h3>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <p className="whitespace-pre-wrap text-sm">{reviewData.transcript}</p>
      </div>
    </div>

    {/* Quiz Section */}
    <div>
      <h3 className="text-lg font-medium mb-2">📚 Quiz Questions</h3>
      {Array.isArray(reviewData?.quiz) && reviewData.quiz.length > 0 ? (
        <div className="space-y-4">
          {reviewData.quiz.map((q, idx) => (
            <div key={idx} className="bg-white p-4 rounded-md border border-gray-200">
              <p className="font-medium mb-2">
                <span className="text-blue-600">Q{idx + 1}:</span> {q.question_text}
              </p>
              <ul className="space-y-2">
                {q.choices.map((choice, i) => (
                  <li 
                    key={i} 
                    className={`text-sm pl-3 py-1 border-l-2 ${
                      choice === q.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {choice === q.correct_answer ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 mr-2 text-gray-300" />
                      )}
                      <span>{choice}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic py-4">No quiz generated for this module.</p>
      )}
    </div>
  </div>

  {/* Sticky Footer Buttons */}
  <div className="border-t border-gray-200 p-4 bg-white flex justify-end gap-2">
    <Button variant="outline" onClick={() => setReviewData(null)}>
      Back to Edit
    </Button>
    <Button
      onClick={handlePublish}
      disabled={isUploading}
      className="bg-green-600 hover:bg-green-700"
    >
      {isUploading ? 'Publishing...' : 'Publish Module'}
    </Button>
  </div>
</div>


          )}
        </DialogContent>
      </Dialog>
    </>
  );
}