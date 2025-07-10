// ModuleViewer.jsx (Enhanced next module UX and course completion)

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleById } from '@/services/modules';
import { getCourseById } from '@/services/courses';
import { ModuleDB } from '@/utils/ModuleDB';
import { saveCompletedOffline } from '@/components2/moduleSync';
import VideoPlayer from './VideoPlayer';
import QuizViewerModal from '@/components2/QuizViewerModal';
import ReviewTranscriptModal from '@/components2/ReviewTranscriptModal';
import { Button } from '@/components2/ui/button';
import { motion } from 'framer-motion';
import ModuleProgressLottie from '@/components2/ui/ModuleProgressLottie';
import { toast } from '@/components2/ui/use-toast';
import { ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import VideoTranscript from './VideoTranscript';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components2/ui/dialog';

export default function ModuleViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [courseRes, setCourseRes] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [nextModule, setNextModule] = useState(null);
  const [nextAvailableOffline, setNextAvailableOffline] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const checkStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);
    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        let mod = await ModuleDB.get(Number(id));
        let course = null;

        if (!mod || !mod.blob) {
          if (!navigator.onLine) throw new Error('Module not available offline');
          const apiRes = await getModuleById(id);
          mod = apiRes;
        }

        if (navigator.onLine) {
          course = await getCourseById(mod.course_id);
          setCourseRes(course.data);
        }

        setModule(mod);
        if (mod.blob) {
          setVideoSrc(URL.createObjectURL(mod.blob));
        } else {
          setVideoSrc(mod.video_url);
        }
      } catch (err) {
        console.error('[ModuleViewer] Load error:', err);
        toast({ title: 'Error loading module', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!module || !courseRes?.modules) return;
    const modulesSorted = [...courseRes.modules].sort((a, b) => a.order - b.order);
    const index = modulesSorted.findIndex((m) => m.id === module.id);
    const next = modulesSorted[index + 1];
    if (next) {
      setNextModule(next);
      ModuleDB.getAllMeta().then((list) => {
        setNextAvailableOffline(list.some((m) => m.id === next.id));
      });
    } else {
      setNextModule(null);
    }
  }, [module, courseRes]);

  const handleMarkAllCompleted = async () => {
    if (!courseRes?.modules) return;
    for (const mod of courseRes.modules) {
      await ModuleDB.markCompleted(mod.id);
      await saveCompletedOffline(mod.id);
      localStorage.removeItem(`module-progress-${mod.id}`);
    }
  };

  const handleComplete = async () => {
    await handleMarkAllCompleted();
    setShowCongrats(true);
  };

  const handleNext = async () => {
    await ModuleDB.markCompleted(module.id);
    await saveCompletedOffline(module.id);
    localStorage.removeItem(`module-progress-${module.id}`);

    const course = await getCourseById(module.course_id);
    const modulesSorted = [...course.data.modules].sort((a, b) => a.order - b.order);
    const index = modulesSorted.findIndex((m) => m.id === module.id);
    const next = modulesSorted[index + 1];

    if (!next) {
      await handleComplete();
    } else {
      const offlineMeta = await ModuleDB.getAllMeta();
      const offlineIds = offlineMeta.map(m => m.id);
      if (!offlineIds.includes(next.id) && isOffline) {
        toast('Module Missing', { description: 'Next Module Unavailable Offline' });
        return;
      }
      navigate(`/modules/${next.id}`);
    }
  };

  const handleProgressUpdate = async (value) => {
    setProgress(value);
    localStorage.setItem(`module-progress-${module.id}`, value);
    await ModuleDB.updateMeta(module.id, { resume_progress: value });
  };

  const handleTimeUpdate = async (time) => {
    setCurrentTime(time);
    await ModuleDB.updateMeta(module.id, { resume_time: time });
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">Loading...</div>
  ) : (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <ModuleProgressLottie progress={progress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <VideoPlayer
              ref={videoRef}
              src={videoSrc}
              moduleId={module.id}
              onEnded={() => {
                if (module.quiz?.questions?.length > 0) {
                  setShowQuiz(true);
                } else {
                  setShowNext(true);
                }
              }}
              onProgress={handleProgressUpdate}
              onDurationChange={setDuration}
              onTimeUpdate={handleTimeUpdate}
              aspectRatio="16/9"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
            <p className="text-sm text-gray-600 mb-2">{module.description}</p>
            <Button
              variant="outline"
              onClick={() => setShowTranscriptModal(true)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View Transcript
            </Button>

            {showNext && (
              <Button
                onClick={handleNext}
                className={`mt-4 w-full flex gap-2 ${nextModule ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {nextModule ? (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Next Module
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Course
                  </>
                )}
              </Button>
            )}
          </div>
          <VideoTranscript
            transcript={module.transcript}
            currentTime={currentTime}
            duration={duration}
            onSeek={(time) => videoRef.current?.seekTo?.(time)}
          />
        </div>
      </div>

      {module.quiz?.questions?.length > 0 && (
        <QuizViewerModal
          quiz={module.quiz}
          open={showQuiz}
          onClose={() => setShowQuiz(false)}
          onSuccess={() => {
            setShowNext(true);
            toast('Quiz Passed!', { description: 'Proceed to next module' });
          }}
        />
      )}

      <ReviewTranscriptModal
        transcript={module.transcript}
        open={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
      />

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-700">🎉 Congratulations!</DialogTitle>
            <p className="text-sm text-gray-600">You've completed the course. Great job!</p>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-4">
            <Button onClick={() => navigate('/dashboard')} className="w-full">Return to Dashboard</Button>
            <Button onClick={() => navigate(`/learner/courses/${module.course_id}`)} variant="outline" className="w-full">Go to Course Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 
